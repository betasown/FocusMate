import mongoose, { Schema, Document } from 'mongoose';

export interface IHomework extends Document {
    title: string;
    subject: string;
    dueDate: Date;
    description?: string;
    createdBy: string;
    createdByName: string;
    guildId: string;
    completed: boolean;
    createdAt: Date;
    updatedAt: Date;
}

const HomeworkSchema: Schema = new Schema(
    {
        title: {
            type: String,
            required: true,
            trim: true,
        },
        subject: {
            type: String,
            required: true,
            trim: true,
        },
        dueDate: {
            type: Date,
            required: true,
        },
        description: {
            type: String,
            trim: true,
        },
        createdBy: {
            type: String,
            required: true,
        },
        createdByName: {
            type: String,
            required: true,
        },
        guildId: {
            type: String,
            required: true,
        },
        completed: {
            type: Boolean,
            default: false,
        },
    },
    {
        timestamps: true,
    }
);

// Index pour améliorer les performances de recherche
HomeworkSchema.index({ guildId: 1, dueDate: 1 });
HomeworkSchema.index({ guildId: 1, completed: 1 });

export default mongoose.model<IHomework>('Homework', HomeworkSchema);
