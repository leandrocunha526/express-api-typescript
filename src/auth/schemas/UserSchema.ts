import * as yup from "yup";

export const UserSchema = yup.object().shape({
    firstname: yup.string().required('First name is required'),
    lastname: yup.string().required('Last name is required'),
    email: yup.string().email('Must be a valid email').required('Email is required'),
    username: yup.string().required('Username is required'),
    password: yup.string().min(8, 'Password must be at least 8 characters long').required('Password is required'),
    role: yup.string().oneOf(['user', 'admin']).default('user')
});
