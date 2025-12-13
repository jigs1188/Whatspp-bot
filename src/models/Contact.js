import mongoose from 'mongoose';

const ContactSchema = new mongoose.Schema({
  phone: { type: String, required: true, unique: true },
  name: { type: String },
  type: { 
    type: String, 
    enum: ['customer', 'bff', 'family', 'friend', 'vip'], 
    default: 'customer' 
  },
  autoReply: { 
    type: mongoose.Schema.Types.Mixed, // boolean or "conditional"
    default: true 
  },
  memory: {
    lastBy: { type: String, enum: ['bot', 'human', 'contact'], default: 'contact' },
    lastMessage: { type: String },
    lastBotReply: { type: String },
    updatedAt: { type: Date, default: Date.now },
    history: [
      {
        role: { type: String, enum: ['user', 'assistant'] },
        content: String,
        timestamp: { type: Date, default: Date.now }
      }
    ]
  },
  // For future expansion (e.g. specific tone per user)
  tone: { type: String, default: 'professional' }
}, { timestamps: true });

export const Contact = mongoose.model('Contact', ContactSchema);
