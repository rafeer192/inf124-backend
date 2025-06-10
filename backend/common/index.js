/*
    form schema for validateform.js
    Only for password and email
    6-28 characters, required
*/
const Yup = require("yup");

const formSchema = Yup.object({
    email: Yup.string()
        .required("email required")
        .min(6, "email too short")
        .max(28, "email too long"),
    password: Yup.string()
        .required("Password required")
        .min(6, "Password too short")
        .max(28, "Password too long"),
});

module.exports = { formSchema };