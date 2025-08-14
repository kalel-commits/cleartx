#!/usr/bin/env python3
"""
CCExtractor Video Receipt OCR Plugin
Provides video receipt text extraction and analysis using CCExtractor library
"""

import os
import sys
import json
import logging
from typing import Dict, List, Optional, Tuple, Any
from dataclasses import dataclass
from datetime import datetime
import cv2
import numpy as np

# CCExtractor imports (in real implementation, install via pip)
try:
    import ccextractor
    from ccextractor import extract_text
    CCEXTRACTOR_AVAILABLE = True
except ImportError:
    CCEXTRACTOR_AVAILABLE = False
    print("Warning: CCExtractor library not available. Install with: pip install ccextractor")

@dataclass
class ReceiptData:
    """Structured receipt data extracted from video"""
    merchant_name: str
    total_amount: float
    currency: str
    date: str
    time: str
    items: List[Dict[str, Any]]
    tax_amount: float
    subtotal: float
    payment_method: str
    receipt_number: str
    confidence_score: float
    raw_text: str
    extracted_at: datetime

@dataclass
class VideoFrame:
    """Video frame data for processing"""
    frame_number: int
    timestamp: float
    image: np.ndarray
    text_regions: List[Dict[str, Any]]

class CCExtractorPlugin:
    """CCExtractor plugin for video receipt OCR"""
    
    def __init__(self, config: Dict[str, Any] = None):
        self.config = config or {}
        self.is_enabled = self.config.get('enabled', True)
        self.supported_formats = ['.mp4', '.avi', '.mov', '.mkv', '.wmv', '.flv']
        self.min_confidence = self.config.get('min_confidence', 0.7)
        self.max_frames = self.config.get('max_frames', 100)
        self.text_detection_model = None
        self.ocr_model = None
        
        # Initialize logging
        logging.basicConfig(level=logging.INFO)
        self.logger = logging.getLogger(__name__)
        
        if not CCEXTRACTOR_AVAILABLE:
            self.logger.warning("CCExtractor library not available. Plugin will use fallback methods.")
    
    def initialize(self) -> bool:
        """Initialize the CCExtractor plugin"""
        try:
            if not self.is_enabled:
                self.logger.info("CCExtractor plugin disabled")
                return False
            
            # Initialize text detection model
            self._initialize_text_detection()
            
            # Initialize OCR model
            self._initialize_ocr()
            
            self.logger.info("CCExtractor plugin initialized successfully")
            return True
            
        except Exception as e:
            self.logger.error(f"Failed to initialize CCExtractor plugin: {e}")
            return False
    
    def _initialize_text_detection(self):
        """Initialize text detection model"""
        try:
            # In real implementation, load a pre-trained text detection model
            # For now, use OpenCV's EAST text detector if available
            self.text_detection_model = cv2.dnn.readNet(
                "frozen_east_text_detection.pb" if os.path.exists("frozen_east_text_detection.pb") else None
            )
        except Exception as e:
            self.logger.warning(f"Text detection model not available: {e}")
            self.text_detection_model = None
    
    def _initialize_ocr(self):
        """Initialize OCR model"""
        try:
            # In real implementation, load a pre-trained OCR model
            # For now, use Tesseract if available
            import pytesseract
            self.ocr_model = pytesseract
        except ImportError:
            self.logger.warning("Tesseract OCR not available. Install with: pip install pytesseract")
            self.ocr_model = None
    
    def extract_receipt_from_video(self, video_path: str, options: Dict[str, Any] = None) -> Dict[str, Any]:
        """Extract receipt data from video file"""
        if not self.is_enabled:
            return {"success": False, "error": "Plugin disabled"}
        
        try:
            # Validate video file
            if not self._validate_video_file(video_path):
                return {"success": False, "error": "Invalid video file"}
            
            # Extract frames with potential receipt content
            frames = self._extract_receipt_frames(video_path, options)
            
            if not frames:
                return {"success": False, "error": "No receipt frames found"}
            
            # Process frames to extract text
            extracted_texts = []
            for frame in frames:
                text = self._extract_text_from_frame(frame, options)
                if text:
                    extracted_texts.append({
                        "frame_number": frame.frame_number,
                        "timestamp": frame.timestamp,
                        "text": text,
                        "confidence": self._calculate_text_confidence(text)
                    })
            
            # Combine and analyze extracted text
            combined_text = self._combine_extracted_texts(extracted_texts)
            receipt_data = self._parse_receipt_text(combined_text)
            
            return {
                "success": True,
                "receipt": receipt_data,
                "frames_processed": len(frames),
                "texts_extracted": len(extracted_texts),
                "confidence": receipt_data.confidence_score if receipt_data else 0.0
            }
            
        except Exception as e:
            self.logger.error(f"Failed to extract receipt from video: {e}")
            return {"success": False, "error": str(e)}
    
    def _validate_video_file(self, video_path: str) -> bool:
        """Validate video file format and existence"""
        if not os.path.exists(video_path):
            return False
        
        file_ext = os.path.splitext(video_path)[1].lower()
        if file_ext not in self.supported_formats:
            return False
        
        # Check if file is readable
        try:
            cap = cv2.VideoCapture(video_path)
            if not cap.isOpened():
                return False
            cap.release()
            return True
        except Exception:
            return False
    
    def _extract_receipt_frames(self, video_path: str, options: Dict[str, Any] = None) -> List[VideoFrame]:
        """Extract frames that likely contain receipt content"""
        frames = []
        options = options or {}
        
        try:
            cap = cv2.VideoCapture(video_path)
            total_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
            fps = cap.get(cv2.CAP_PROP_FPS)
            
            # Determine frame sampling strategy
            sample_interval = max(1, total_frames // self.max_frames)
            
            frame_count = 0
            while cap.isOpened():
                ret, frame = cap.read()
                if not ret:
                    break
                
                # Sample frames based on interval
                if frame_count % sample_interval == 0:
                    # Check if frame contains potential receipt content
                    if self._is_receipt_frame(frame):
                        timestamp = frame_count / fps
                        video_frame = VideoFrame(
                            frame_number=frame_count,
                            timestamp=timestamp,
                            image=frame.copy(),
                            text_regions=[]
                        )
                        frames.append(video_frame)
                
                frame_count += 1
                
                # Limit number of frames processed
                if len(frames) >= self.max_frames:
                    break
            
            cap.release()
            
        except Exception as e:
            self.logger.error(f"Error extracting frames: {e}")
        
        return frames
    
    def _is_receipt_frame(self, frame: np.ndarray) -> bool:
        """Determine if a frame likely contains receipt content"""
        try:
            # Convert to grayscale
            gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
            
            # Apply edge detection
            edges = cv2.Canny(gray, 50, 150)
            
            # Find contours
            contours, _ = cv2.findContours(edges, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
            
            # Look for rectangular shapes (potential receipts)
            receipt_likelihood = 0
            for contour in contours:
                area = cv2.contourArea(contour)
                if area > 1000:  # Minimum area threshold
                    # Approximate contour to polygon
                    epsilon = 0.02 * cv2.arcLength(contour, True)
                    approx = cv2.approxPolyDP(contour, epsilon, True)
                    
                    # Check if it's roughly rectangular
                    if len(approx) == 4:
                        receipt_likelihood += 1
            
            # Check text density
            text_density = self._calculate_text_density(gray)
            
            # Combine factors for final decision
            return receipt_likelihood > 0 or text_density > 0.1
            
        except Exception as e:
            self.logger.error(f"Error analyzing frame: {e}")
            return False
    
    def _calculate_text_density(self, gray_image: np.ndarray) -> float:
        """Calculate the density of text-like features in an image"""
        try:
            # Apply morphological operations to identify text regions
            kernel = cv2.getStructuringElement(cv2.MORPH_RECT, (3, 3))
            morph = cv2.morphologyEx(gray_image, cv2.MORPH_CLOSE, kernel)
            
            # Count text-like pixels
            text_pixels = np.sum(morph < 128)
            total_pixels = morph.size
            
            return text_pixels / total_pixels if total_pixels > 0 else 0
            
        except Exception as e:
            self.logger.error(f"Error calculating text density: {e}")
            return 0.0
    
    def _extract_text_from_frame(self, frame: VideoFrame, options: Dict[str, Any] = None) -> Optional[str]:
        """Extract text from a video frame"""
        try:
            if CCEXTRACTOR_AVAILABLE:
                # Use CCExtractor library
                return self._extract_text_ccextractor(frame.image, options)
            elif self.ocr_model:
                # Use Tesseract OCR
                return self._extract_text_tesseract(frame.image, options)
            else:
                # Fallback to basic text detection
                return self._extract_text_basic(frame.image, options)
                
        except Exception as e:
            self.logger.error(f"Error extracting text from frame: {e}")
            return None
    
    def _extract_text_ccextractor(self, image: np.ndarray, options: Dict[str, Any] = None) -> Optional[str]:
        """Extract text using CCExtractor library"""
        try:
            # Convert image to format suitable for CCExtractor
            # In real implementation, use the actual CCExtractor API
            options = options or {}
            
            # Simulate CCExtractor text extraction
            # This would be replaced with actual CCExtractor calls
            text = extract_text(image, options)
            return text
            
        except Exception as e:
            self.logger.error(f"CCExtractor text extraction failed: {e}")
            return None
    
    def _extract_text_tesseract(self, image: np.ndarray, options: Dict[str, Any] = None) -> Optional[str]:
        """Extract text using Tesseract OCR"""
        try:
            options = options or {}
            
            # Preprocess image for better OCR
            processed_image = self._preprocess_image_for_ocr(image)
            
            # Extract text using Tesseract
            text = self.ocr_model.image_to_string(
                processed_image,
                config='--psm 6'  # Assume uniform block of text
            )
            
            return text.strip() if text else None
            
        except Exception as e:
            self.logger.error(f"Tesseract OCR failed: {e}")
            return None
    
    def _extract_text_basic(self, image: np.ndarray, options: Dict[str, Any] = None) -> Optional[str]:
        """Basic text extraction using OpenCV"""
        try:
            # Convert to grayscale
            gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
            
            # Apply threshold to get binary image
            _, binary = cv2.threshold(gray, 0, 255, cv2.THRESH_BINARY + cv2.THRESH_OTSU)
            
            # Find contours (potential text regions)
            contours, _ = cv2.findContours(binary, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
            
            # Extract text from contours (simplified)
            text_regions = []
            for contour in contours:
                area = cv2.contourArea(contour)
                if area > 100:  # Minimum area for text
                    x, y, w, h = cv2.boundingRect(contour)
                    text_regions.append((x, y, w, h))
            
            # For basic extraction, return a placeholder
            # In real implementation, this would use more sophisticated text recognition
            return f"Text detected in {len(text_regions)} regions"
            
        except Exception as e:
            self.logger.error(f"Basic text extraction failed: {e}")
            return None
    
    def _preprocess_image_for_ocr(self, image: np.ndarray) -> np.ndarray:
        """Preprocess image for better OCR results"""
        try:
            # Convert to grayscale
            gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
            
            # Apply Gaussian blur to reduce noise
            blurred = cv2.GaussianBlur(gray, (5, 5), 0)
            
            # Apply adaptive threshold
            thresh = cv2.adaptiveThreshold(
                blurred, 255, cv2.ADAPTIVE_THRESH_GAUSSIAN_C, cv2.THRESH_BINARY, 11, 2
            )
            
            # Apply morphological operations
            kernel = cv2.getStructuringElement(cv2.MORPH_RECT, (2, 2))
            processed = cv2.morphologyEx(thresh, cv2.MORPH_CLOSE, kernel)
            
            return processed
            
        except Exception as e:
            self.logger.error(f"Image preprocessing failed: {e}")
            return image
    
    def _calculate_text_confidence(self, text: str) -> float:
        """Calculate confidence score for extracted text"""
        if not text:
            return 0.0
        
        # Simple confidence calculation based on text characteristics
        confidence = 0.0
        
        # Length factor
        if len(text) > 10:
            confidence += 0.2
        
        # Contains numbers (likely amounts)
        if any(char.isdigit() for char in text):
            confidence += 0.3
        
        # Contains currency symbols
        if any(symbol in text for symbol in ['$', '€', '£', '₹', '¥']):
            confidence += 0.2
        
        # Contains date-like patterns
        if any(pattern in text for pattern in ['/', '-', '.']):
            confidence += 0.1
        
        # Contains common receipt words
        receipt_words = ['total', 'subtotal', 'tax', 'receipt', 'amount', 'payment']
        if any(word.lower() in text.lower() for word in receipt_words):
            confidence += 0.2
        
        return min(confidence, 1.0)
    
    def _combine_extracted_texts(self, extracted_texts: List[Dict[str, Any]]) -> str:
        """Combine multiple text extractions into a single coherent text"""
        if not extracted_texts:
            return ""
        
        # Sort by confidence and timestamp
        sorted_texts = sorted(extracted_texts, key=lambda x: (x['confidence'], x['timestamp']), reverse=True)
        
        # Combine texts, giving priority to higher confidence extractions
        combined = []
        seen_texts = set()
        
        for text_data in sorted_texts:
            text = text_data['text'].strip()
            if text and text not in seen_texts:
                combined.append(text)
                seen_texts.add(text)
        
        return "\n".join(combined)
    
    def _parse_receipt_text(self, text: str) -> Optional[ReceiptData]:
        """Parse extracted text into structured receipt data"""
        if not text:
            return None
        
        try:
            # Simple parsing logic - in real implementation, use more sophisticated NLP
            lines = text.split('\n')
            
            receipt_data = ReceiptData(
                merchant_name=self._extract_merchant_name(lines),
                total_amount=self._extract_total_amount(text),
                currency=self._extract_currency(text),
                date=self._extract_date(text),
                time=self._extract_time(text),
                items=self._extract_items(lines),
                tax_amount=self._extract_tax_amount(text),
                subtotal=self._extract_subtotal(text),
                payment_method=self._extract_payment_method(text),
                receipt_number=self._extract_receipt_number(text),
                confidence_score=self._calculate_text_confidence(text),
                raw_text=text,
                extracted_at=datetime.now()
            )
            
            return receipt_data
            
        except Exception as e:
            self.logger.error(f"Failed to parse receipt text: {e}")
            return None
    
    def _extract_merchant_name(self, lines: List[str]) -> str:
        """Extract merchant name from receipt lines"""
        # Look for merchant name in first few lines
        for line in lines[:5]:
            line = line.strip()
            if line and not any(char.isdigit() for char in line):
                return line
        return "Unknown Merchant"
    
    def _extract_total_amount(self, text: str) -> float:
        """Extract total amount from receipt text"""
        import re
        
        # Look for total amount patterns
        patterns = [
            r'total[:\s]*[\$€£₹¥]?(\d+\.?\d*)',
            r'[\$€£₹¥](\d+\.?\d*)\s*total',
            r'amount[:\s]*[\$€£₹¥]?(\d+\.?\d*)'
        ]
        
        for pattern in patterns:
            match = re.search(pattern, text.lower())
            if match:
                try:
                    return float(match.group(1))
                except ValueError:
                    continue
        
        return 0.0
    
    def _extract_currency(self, text: str) -> str:
        """Extract currency from receipt text"""
        currency_symbols = {
            '$': 'USD',
            '€': 'EUR',
            '£': 'GBP',
            '₹': 'INR',
            '¥': 'JPY'
        }
        
        for symbol, code in currency_symbols.items():
            if symbol in text:
                return code
        
        return 'USD'  # Default currency
    
    def _extract_date(self, text: str) -> str:
        """Extract date from receipt text"""
        import re
        
        # Look for date patterns
        date_patterns = [
            r'(\d{1,2}[/-]\d{1,2}[/-]\d{2,4})',
            r'(\d{4}[/-]\d{1,2}[/-]\d{1,2})'
        ]
        
        for pattern in date_patterns:
            match = re.search(pattern, text)
            if match:
                return match.group(1)
        
        return datetime.now().strftime('%Y-%m-%d')
    
    def _extract_time(self, text: str) -> str:
        """Extract time from receipt text"""
        import re
        
        # Look for time patterns
        time_pattern = r'(\d{1,2}:\d{2}(?::\d{2})?\s*(?:AM|PM)?)'
        match = re.search(time_pattern, text, re.IGNORECASE)
        
        if match:
            return match.group(1)
        
        return datetime.now().strftime('%H:%M:%S')
    
    def _extract_items(self, lines: List[str]) -> List[Dict[str, Any]]:
        """Extract individual items from receipt lines"""
        items = []
        
        for line in lines:
            line = line.strip()
            if line and '$' in line or '€' in line or '£' in line or '₹' in line or '¥' in line:
                # Simple item parsing - in real implementation, use more sophisticated parsing
                items.append({
                    "description": line,
                    "price": 0.0,  # Would extract actual price
                    "quantity": 1
                })
        
        return items
    
    def _extract_tax_amount(self, text: str) -> float:
        """Extract tax amount from receipt text"""
        import re
        
        tax_patterns = [
            r'tax[:\s]*[\$€£₹¥]?(\d+\.?\d*)',
            r'[\$€£₹¥](\d+\.?\d*)\s*tax'
        ]
        
        for pattern in tax_patterns:
            match = re.search(pattern, text.lower())
            if match:
                try:
                    return float(match.group(1))
                except ValueError:
                    continue
        
        return 0.0
    
    def _extract_subtotal(self, text: str) -> float:
        """Extract subtotal from receipt text"""
        import re
        
        subtotal_patterns = [
            r'subtotal[:\s]*[\$€£₹¥]?(\d+\.?\d*)',
            r'[\$€£₹¥](\d+\.?\d*)\s*subtotal'
        ]
        
        for pattern in subtotal_patterns:
            match = re.search(pattern, text.lower())
            if match:
                try:
                    return float(match.group(1))
                except ValueError:
                    continue
        
        return 0.0
    
    def _extract_payment_method(self, text: str) -> str:
        """Extract payment method from receipt text"""
        payment_methods = ['cash', 'credit', 'debit', 'card', 'check', 'mobile']
        
        for method in payment_methods:
            if method in text.lower():
                return method.title()
        
        return "Unknown"
    
    def _extract_receipt_number(self, text: str) -> str:
        """Extract receipt number from receipt text"""
        import re
        
        # Look for receipt number patterns
        receipt_patterns = [
            r'receipt[:\s]*#?(\d+)',
            r'ref[:\s]*#?(\d+)',
            r'number[:\s]*#?(\d+)'
        ]
        
        for pattern in receipt_patterns:
            match = re.search(pattern, text.lower())
            if match:
                return match.group(1)
        
        return "Unknown"
    
    def get_status(self) -> Dict[str, Any]:
        """Get plugin status"""
        return {
            "enabled": self.is_enabled,
            "ccextractor_available": CCEXTRACTOR_AVAILABLE,
            "text_detection_available": self.text_detection_model is not None,
            "ocr_available": self.ocr_model is not None,
            "supported_formats": self.supported_formats,
            "min_confidence": self.min_confidence,
            "max_frames": self.max_frames
        }

# Main execution for testing
if __name__ == "__main__":
    # Example usage
    plugin = CCExtractorPlugin()
    
    if plugin.initialize():
        print("CCExtractor plugin initialized successfully")
        print("Status:", json.dumps(plugin.get_status(), indent=2))
    else:
        print("Failed to initialize CCExtractor plugin")
