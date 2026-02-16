import z4 from "zod/v4";

const createSpecialtyZodSchema = z4.object({
    title: z4.string( "Title is required"),
    description: z4.string("Description is required").optional(),
})


export const specialtyValidation = {
    createSpecialtyZodSchema,
}