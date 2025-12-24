import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export type SlideStatus = "active" | "draft";
export type ViewMode = "desktop" | "mobile";

export interface Slide {
     id: number;
     title: string;
     status: SlideStatus;
     imageUrl: string;
     linkTarget: string;
}

export interface FixedImage {
     id: number;
     title: string;
     position: "top" | "bottom";
     imageUrl: string;
     linkTarget: string;
}

interface HomeEditorState {
     activeView: ViewMode;
     slides: Slide[];
     fixedImages: FixedImage[];
}

const initialState: HomeEditorState = {
     activeView: "desktop",
     slides: [
          {
               id: 1,
               title: "Slide 1",
               status: "active",
               imageUrl:
                    "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab",
               linkTarget: "collections/summer-sale",
          },
          {
               id: 2,
               title: "Slide 2",
               status: "draft",
               imageUrl: "",
               linkTarget: "",
          },
     ],
     fixedImages: [
          {
               id: 1,
               title: "Top Image",
               position: "top",
               imageUrl:
                    "https://images.unsplash.com/photo-1544982503-9f984c14501a",
               linkTarget: "products/organic-catch",
          },
          {
               id: 2,
               title: "Bottom Image",
               position: "bottom",
               imageUrl:
                    "https://images.unsplash.com/photo-1579895697621-e37456d22b6f",
               linkTarget: "collections/fresh-seafood",
          },
     ],
};

export const homeEditorSlice = createSlice({
     name: "homeEditor",
     initialState,
     reducers: {
          setActiveView: (state, action: PayloadAction<ViewMode>) => {
               state.activeView = action.payload;
          },
          addSlide: (state) => {
               const newSlide: Slide = {
                    id: Math.max(0, ...state.slides.map((s) => s.id)) + 1,
                    title: `Slide ${state.slides.length + 1}`,
                    status: "draft",
                    imageUrl: "",
                    linkTarget: "",
               };
               state.slides.push(newSlide);
          },
          updateSlide: (
               state,
               action: PayloadAction<{
                    id: number;
                    field: keyof Slide;
                    value: string;
               }>
          ) => {
               const { id, field, value } = action.payload;
               const slide = state.slides.find((s) => s.id === id);
               if (slide) {
                    (slide as any)[field] = value;
               }
          },
          deleteSlide: (state, action: PayloadAction<number>) => {
               state.slides = state.slides.filter(
                    (slide) => slide.id !== action.payload
               );
          },
          duplicateSlide: (state, action: PayloadAction<number>) => {
               const slideToDuplicate = state.slides.find(
                    (s) => s.id === action.payload
               );
               if (slideToDuplicate) {
                    const duplicatedSlide: Slide = {
                         ...slideToDuplicate,
                         id: Math.max(0, ...state.slides.map((s) => s.id)) + 1,
                         title: `${slideToDuplicate.title} (Copy)`,
                         status: "draft",
                    };
                    state.slides.push(duplicatedSlide);
               }
          },
          updateFixedImage: (
               state,
               action: PayloadAction<{
                    id: number;
                    field: keyof FixedImage;
                    value: string;
               }>
          ) => {
               const { id, field, value } = action.payload;
               const image = state.fixedImages.find((i) => i.id === id);
               if (image) {
                    (image as any)[field] = value;
               }
          },
          reorderSlides: (
               state,
               action: PayloadAction<{ fromIndex: number; toIndex: number }>
          ) => {
               const { fromIndex, toIndex } = action.payload;
               const [removed] = state.slides.splice(fromIndex, 1);
               state.slides.splice(toIndex, 0, removed);
          },
     },
});

export const {
     setActiveView,
     addSlide,
     updateSlide,
     deleteSlide,
     duplicateSlide,
     updateFixedImage,
     reorderSlides,
} = homeEditorSlice.actions;

export default homeEditorSlice.reducer;
