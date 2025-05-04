import axios from 'axios';
import crypto from 'crypto';

const config = {
    app_id: '554', // Thay bằng app_id từ ZaloPay Merchant Portal
    key1: '8NdU5pG5R2spGHGhyO99HN1OhD8IQJBn', // Thay bằng mac_key1 từ ZaloPay
    key2: 'uUfsWgfLkRLzq6W2uNXTCxrfxs51auny', // Thay bằng mac_key2 từ ZaloPay
    endpoint: 'https://sb-openapi.zalopay.vn/v2/create', // API sandbox, thay bằng production khi đi live
};

const createZaloPayOrder = async (orderData) => {
    const { amount, orderId, description } = orderData;

    const transId = Math.floor(Math.random() * 1000000); // Tạo mã giao dịch ngẫu nhiên
    const embed_data = {
        redirecturl: 'http://localhost:3000/orderSuccess', // URL redirect sau khi thanh toán
    };

    const items = []; // Danh sách sản phẩm, có thể để trống nếu không cần
    const params = {
        app_id: config.app_id,
        app_trans_id: `${new Date()
            .toISOString()
            .slice(0, 10)
            .replace(/-/g, '')}_${transId}`,
        app_time: Date.now(),
        app_user: 'user123', // ID hoặc tên người dùng
        amount: amount,
        description: description || `Thanh toán đơn hàng ${orderId}`,
        bank_code: '', // Để trống nếu không chỉ định ngân hàng
        item: JSON.stringify(items),
        embed_data: JSON.stringify(embed_data),
    };

    // Tạo chữ ký (HMAC SHA256)
    const data = `${params.app_id}|${params.app_trans_id}|${params.app_user}|${params.amount}|${params.app_time}|${params.embed_data}|${params.item}`;
    params.mac = crypto
        .createHmac('sha256', config.key1)
        .update(data)
        .digest('hex');

    try {
        const response = await axios.post(config.endpoint, params);
        return response.data; // Trả về dữ liệu từ ZaloPay (bao gồm zp_trans_token)
    } catch (error) {
        throw new Error('Lỗi khi tạo đơn hàng ZaloPay: ' + error.message);
    }
};

export default createZaloPayOrder;
