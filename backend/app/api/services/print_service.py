import os
import logging
from app.core.config import settings

logger = logging.getLogger(__name__)

class PrintService:
    """
    Dịch vụ xử lý in ảnh.
    Hiện tại là phiên bản giả lập, sẽ được thay thế bằng kết nối thực với máy in sau.
    """
    def __init__(self):
        self.print_queue = []
        logger.info("Print service initialized (simulation mode)")
        
    def add_to_queue(self, image_path, copies=1, options=None):
        """
        Thêm một ảnh vào hàng đợi in
        """
        if not os.path.exists(image_path):
            raise FileNotFoundError(f"Image not found: {image_path}")
        
        print_job = {
            "image_path": image_path,
            "copies": copies,
            "options": options or {},
            "status": "queued"
        }
        
        self.print_queue.append(print_job)
        job_id = len(self.print_queue) - 1
        logger.info(f"Added image to print queue: {image_path}, job ID: {job_id}")
        
        return {
            "job_id": job_id,
            "status": "queued"
        }
    
    def get_job_status(self, job_id):
        """
        Kiểm tra trạng thái của một lệnh in
        """
        if not 0 <= job_id < len(self.print_queue):
            raise ValueError(f"Invalid job ID: {job_id}")
        
        return self.print_queue[job_id]
    
    def print_image(self, job_id):
        """
        Xử lý in một ảnh từ hàng đợi
        Hiện tại chỉ là giả lập, sẽ được tích hợp thực tế sau
        """
        if not 0 <= job_id < len(self.print_queue):
            raise ValueError(f"Invalid job ID: {job_id}")
        
        job = self.print_queue[job_id]
        
        # Update status to processing
        job["status"] = "processing"
        logger.info(f"Processing print job {job_id}: {job['image_path']}")
        
        try:
            # Giả lập quá trình in
            logger.info(f"[SIMULATION] Printing image: {job['image_path']}, copies: {job['copies']}")
            
            # Update job to completed
            job["status"] = "completed"
            logger.info(f"Print job {job_id} completed")
            
            return {
                "job_id": job_id,
                "status": "completed",
                "message": "Print simulation successful"
            }
        except Exception as e:
            job["status"] = "failed"
            job["error"] = str(e)
            logger.error(f"Print job {job_id} failed: {e}")
            
            return {
                "job_id": job_id,
                "status": "failed",
                "error": str(e)
            }
