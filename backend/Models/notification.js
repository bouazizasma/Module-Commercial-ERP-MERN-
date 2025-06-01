const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const NotificationSchema = new Schema({
    message: {
        type: String,
        required: true
    },
    articleId: {
        type: Schema.Types.ObjectId,
        ref: 'article'
    },
    read: {
        type: Boolean,
        default: false
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    type: {
        type: String,
        enum: ['stock', 'system', 'alert'],
        default: 'stock'
    }
});

const Notification = mongoose.model('notification', NotificationSchema);
module.exports = Notification;