import React from 'react'
import { useForm } from "react-hook-form";
import { Link } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";


const Register = () => {
    const { signup } = useAuth();
    const { register, handleSubmit, formState: { errors } } = useForm();

    const onSubmit = async (data) => {
        const res = await signup(data);
        console.log(res);
    }
    return (
        <div id="page-container" className="main-container">
            <div className="main-container">
                <div className="bg-body-dark bg-pattern">
                    <div className="row mx-0 justify-content-center">
                        <div className="hero-static col-lg-6 col-xl-4">
                            <div className="content content-full overflow-hidden">
                                <form className="js-validation-signin py-30" onSubmit={handleSubmit(onSubmit)}>
                                    <div className="block block-themed block-rounded block-shadow">
                                        <div className="block-header bg-gd-dusk">
                                            <h3 className="block-title">Please Sign In</h3>
                                            <Link to="/" type="submit" className="text-white" data-toggle="click-ripple">
                                                <i className="fa fa-arrow-left mr-5"></i> Back
                                            </Link>
                                        </div>
                                        <div className="block-content my-20">
                                            <div className="form-group">
                                                <div className="col-12">
                                                    <label >Firstname</label>
                                                    <input type="text" className="form-control" id="register_firstname" {...register("firstname", { required: true })} name="firstname" />
                                                </div>
                                            </div>
                                            <div className="form-group">
                                                <div className="col-12">
                                                    <label >Lastname</label>
                                                    <input type="text" className="form-control" id="register_lastname" {...register("lastname", { required: true })} name="lastname" />
                                                </div>
                                            </div>
                                            <div className="form-group d-flex">
                                                <div className="col-6">
                                                    <label >Birthday</label>
                                                    <input type="date" className="form-control" id="register_birthdate" {...register("birthdate", { required: true })} name="birthdate" />
                                                </div>
                                                <div className="col-6">
                                                    <label >Contact Number</label>
                                                    <input type="text" className="form-control" maxLength="11" {...register("contact_number", { required: true })} id="register_contact" name="contact_number" />
                                                </div>
                                            </div>
                                            <div className="form-group">
                                                <div className="col-12">
                                                    <label >Address</label>
                                                    <input type="text" className="form-control" id="register_address" {...register("address", { required: true })} name="address" />
                                                </div>
                                            </div>
                                            <div className="form-group">
                                                <div className="col-12">
                                                    <label >Username</label>
                                                    <input type="username" className="form-control" id="register_username" {...register("username", { required: true })} name="username" />
                                                </div>

                                            </div>
                                            <div className="form-group">
                                                <div className="col-12">
                                                    <label >Password</label>
                                                    <input type="password" className="form-control" id="register_password" {...register("password", { required: true })} name="password" />
                                                </div>
                                            </div>

                                            <div className="form-group mb-0 py-20">
                                                <div className="col-sm-12 text-center  push">
                                                    <button type="submit" className="btn btn-alt-primary" data-toggle="click-ripple">
                                                        <i className="fa fa-user-plus mr-10"></i> Register
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Register