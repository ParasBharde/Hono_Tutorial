import { Schema, model } from "mongoose";

export interface FavYOutubeSchema {
    title: string;
    description: string;
    thumbnailUrl?: string;
    watched: boolean;
    youtuberName: string;
}

const FavYoutubeSchema = new Schema<FavYOutubeSchema>({
    title: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    thumbnailUrl: {
        type: String,
        required: false,
        default: "https://res.cloudinary.com/dixj17hz9/video/upload/v1705590034/video_o6ariq.mp4",
    },
    watched: {
        type: Boolean,
        required: true,
        default: false
    },
    youtuberName: {
        type: String,
        required: true
    }

})

const FavYoutubeModel = model('youtube-videos', FavYoutubeSchema);
export default FavYoutubeModel