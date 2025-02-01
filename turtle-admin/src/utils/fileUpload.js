import axios from 'axios';

const uploadImgMinio = async (file, onProgress) => {
    const formData = new FormData();
    formData.append('file', file);

    const headers = {
        'Authorization': `Bearer ${localStorage.getItem("token")}`,
        'Content-Type': 'multipart/form-data'
    };

    try {
        const response = await axios.post('/api/file/min-upload-img', formData, {
            headers,
            onUploadProgress: progressEvent => {
                if (onProgress) {
                    onProgress((progressEvent.loaded / progressEvent.total) * 100); // 转换成百分比
                }
            }
        });
        return response.data;  // 返回上传后的图片 URL
    } catch (error) {
        console.error('Error uploading file:', error);
        throw error;
    }
};

// 正确导出模块
export default {
    uploadImgMinio
};
