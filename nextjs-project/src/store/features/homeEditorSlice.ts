import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export type ViewMode = "desktop" | "mobile";

export interface Slide {
     id: number;
     title: string;
     position: number; // Numeric position for ordering
     imageUrl: string;
     linkTarget: string;
     linkStatus?: boolean;
}

export interface FixedImage {
     id: number;
     title: string;
     position: "top" | "bottom"; // String position for top/bottom
     imageUrl: string;
     linkTarget: string;
     linkStatus?: boolean;
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
               position: 1,
               title: "Slide 1",
               imageUrl:
                    "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab",
               linkTarget: "collections/summer-sale",
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
                    position: state.slides.length + 1, // Add position
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
                    value: string | number; // Allow both string and number
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
               // Recalculate positions after deletion
               state.slides.forEach((slide, index) => {
                    slide.position = index + 1;
               });
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
                         position: state.slides.length + 1,
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

               // Update positions after reordering
               state.slides.forEach((slide, index) => {
                    slide.position = index + 1;
               });
          },
          updateSlidePosition: (
               state,
               action: PayloadAction<{ id: number; newPosition: number }>
          ) => {
               const { id, newPosition } = action.payload;
               const slide = state.slides.find((s) => s.id === id);
               if (slide) {
                    slide.position = newPosition;
                    // Sort slides by position
                    state.slides.sort((a, b) => a.position - b.position);
               }
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
     updateSlidePosition,
} = homeEditorSlice.actions;

export default homeEditorSlice.reducer;
