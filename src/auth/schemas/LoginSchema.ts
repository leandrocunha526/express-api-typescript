import * as yup from "yup";

export const LoginSchema = yup.object().shape({
    username: yup.string().required('Username is required'),
    password: yup.string().min(8, 'Password must be at least 8 characters long').required('Password is required'),
});
