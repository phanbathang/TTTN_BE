import dotenv from 'dotenv';
import nodemailer from 'nodemailer';

dotenv.config();

export const sendEmailCreateOrder = async (email, orderItems) => {
    let transporter = nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 465,
        secure: true,
        auth: {
            user: process.env.MAIL_ACCOUNT,
            pass: process.env.MAIL_PASSWORD,
        },
        tls: {
            rejectUnauthorized: false,
        },
    });

    let listItem = '';
    const attachImage = [];
    orderItems.forEach((order, index) => {
        const totalItemPrice = (order.amount * order.price).toLocaleString(
            'vi-VN',
            { style: 'currency', currency: 'VND' },
        );
        listItem += `
            <div style="margin-bottom: 20px;">
                <h3 style="color: #333;">Sản phẩm ${index + 1}: ${
            order.name
        }</h3>
                <p>Số lượng: <b>${order.amount}</b></p>
                <p>Giá mỗi sản phẩm: <b>${order.price.toLocaleString('vi-VN', {
                    style: 'currency',
                    currency: 'VND',
                })}</b></p>
                <p>Tổng giá: <b>${totalItemPrice}</b></p>
                <p>Hình ảnh sản phẩm:</p>
                <img src="cid:image${index}" alt="${
            order.name
        }" style="max-width: 200px; height: auto;" />
            </div>
        `;
        attachImage.push({
            path: order.image,
            cid: `image${index}`, // Unique CID for embedding image in HTML
        });
    });

    // Calculate total order price
    const totalOrderPrice = orderItems
        .reduce((sum, order) => sum + order.amount * order.price, 0)
        .toLocaleString('vi-VN', { style: 'currency', currency: 'VND' });

    // Send mail with defined transport object
    let info = await transporter.sendMail({
        from: process.env.MAIL_ACCOUNT, // Sender address
        to: email, // Receiver's email (use the provided email parameter)
        subject: 'Đặt hàng thành công tại THANGBOOK!', // Subject line
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 8px;">
                <h2 style="color: #4CAF50;">Đặt hàng thành công!</h2>
                <p>Cảm ơn bạn đã đặt hàng tại <b>THANGBOOK</b>. Dưới đây là chi tiết đơn hàng của bạn:</p>
                <hr style="border: 1px solid #eee;" />
                ${listItem}
                <hr style="border: 1px solid #eee;" />
                <h3 style="color: #333;">Tổng giá trị đơn hàng: <b>${totalOrderPrice}</b></h3>
                <p>Chúng tôi sẽ xử lý đơn hàng của bạn sớm nhất có thể. Nếu có bất kỳ câu hỏi nào, vui lòng liên hệ với chúng tôi!</p>
                <p style="color: #888;">Trân trọng,<br>Đội ngũ THANGBOOK</p>
            </div>
        `, // HTML body
        attachments: attachImage, // Attach images with CID for embedding
    });

    return info;
};
