<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\UsersModel;
use App\Mail\PayrollMail;
use App\Mail\NewEmployeeMail;
use App\Mail\ForgotPasswordMail;
use App\Mail\NewAnnouncementMail;
use App\Mail\ReferralInternalMail;
use App\Mail\ReferralMail;
use App\Mail\VerifyCodeMail;

use Exception;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;

class MailController extends Controller
{
    public function referralConfirmationMail(Request $request)
    {
        try {
            $user = $request->user();

            $details = [
                'name' => $user->contact_fname,
            ];

            Mail::to($user->contact_email)->send(new ReferralMail($details));
            Mail::to('support@manpro.ph')->send(new ReferralInternalMail($details));

            return response([
                'success' => true,
            ]);
        } catch (\Throwable $th) {
            return response([
                'success' => false,
            ]);
        }
    }

    public function payrollMail(Request $request, $id)
    {
        $payroll_recordsData = DB::table('hr_payroll_allrecords')
            ->select(DB::raw("*"))
            ->where('payroll_id', '=', $id)
            ->where('hr_payroll_allrecords.is_deleted', '=', 0)
            ->get();


        foreach ($payroll_recordsData as $payroll_record) {
            $users = DB::table('user')
                ->select(DB::raw("
            user.email,
            user.fname,
            user.mname,
            user.lname
             "))
                ->where('is_deleted', '=', 0)
                ->where('user_id', '=', $payroll_record->emp_id)
                ->get();



            foreach ($users as $user) {
                $fullname = $user->fname . ' ' . $user->lname;
                $email = $user->email;
                $payroll_date = date('F j, Y', strtotime($payroll_record->payroll_fromdate)) . ' to ' . date('F j, Y', strtotime($payroll_record->payroll_todate)) . ' / 15 days Cut off';

                try {
                    $details = [
                        'name' => $fullname,
                        'payrollDate' => $payroll_date
                    ];

                    Mail::to($email)->send(new PayrollMail($details));

                    // Log successful email sending
                    Log::info("Email sent successfully to $email");
                } catch (\Exception $e) {
                    // Log the exception for debugging
                    Log::error("Error sending email to $email: " . $e->getMessage());

                    return response()->json([
                        'status' => 421,
                        'userData' => $e->getMessage(),
                    ]);
                }
            }
        }

        // Return a response outside of the loop
        return response()->json([
            'status' => 200,
            'userData' => 'Success',
        ]);
    }

    public function newEmployeeMail(Request $request, $id)
    {
        try {
            // Query the database to retrieve user data
            $user = DB::table('user')
                ->select('email', 'fname', 'lname', 'team')
                ->where('is_deleted', 0)
                ->where('user_id', $id)
                ->first();

            if ($user) {
                $fullname = $user->fname . ' ' . $user->lname;
                $company = $user->team;
                $email = $user->email;

                $details = [
                    'name' => $fullname,
                    'company' => $company,
                ];

                Mail::to($email)->send(new NewEmployeeMail($details));

                // Log successful email sending
                Log::info("Email sent successfully to $email");

                return response()->json([
                    'status' => 200,
                    'userData' => 'Success',
                ]);
            } else {
                return response()->json([
                    'status' => 404, // Not Found
                    'userData' => 'User not found',
                ]);
            }
        } catch (\Exception $e) {
            // Log the exception for debugging
            Log::error("Error sending email: " . $e->getMessage());

            return response()->json([
                'status' => 500,
                'userData' => 'Server error',
            ]);
        }
    }

    public function newEmployeeMailLink(Request $request, $id)
    {
        try {
            // Query the database to retrieve user data
            $user = DB::table('user')
                ->select('email', 'fname', 'lname', 'team')
                ->where('is_deleted', 0)
                ->where('user_id', $id)
                ->first();

            if ($user) {
                $fullname = $user->fname . ' ' . $user->lname;
                $company = $user->team;
                $email = $user->email;

                $details = [
                    'name' => $fullname,
                    'company' => $company,
                ];

                Mail::to($email)->send(new NewEmployeeMail($details));

                // Log successful email sending
                Log::info("Email sent successfully to $email");

                return response()->json([
                    'status' => 200,
                    'userData' => 'Success',
                ]);
            } else {
                return response()->json([
                    'status' => 404, // Not Found
                    'userData' => 'User not found',
                ]);
            }
        } catch (\Exception $e) {
            // Log the exception for debugging
            Log::error("Error sending email: " . $e->getMessage());

            return response()->json([
                'status' => 500,
                'userData' => 'Server error',
            ]);
        }
    }

    public function newAnnouncementMail(Request $request, $id)
    {
        log::info("MailController::newAnnouncementMail");

        $user = DB::table('user')
            ->select('*')
            ->where('user_id', $id)
            ->first();
        try {
            // Query the database to retrieve user data
            $users = DB::table('user')
                ->select('email', 'fname', 'lname', 'team')
                ->where('is_deleted', 0)
                ->where('team', $user->team)
                ->where('user_type', 'Member')
                ->get();

            if ($users) {
                foreach ($users as $user) {
                    $fullname = $user->fname . ' ' . $user->lname;
                    $company = $user->team;
                    $email = $user->email;

                    $details = [
                        'name' => $fullname,
                        'company' => $company,
                    ];

                    Mail::to($email)->send(new NewAnnouncementMail($details));

                    // Log successful email sending
                    Log::info("Announcement email sent successfully to $email");
                }
                return response()->json([
                    'status' => 200,
                    'userData' => 'Success',
                ]);
            } else {
                return response()->json([
                    'status' => 404, // Not Found
                    'userData' => 'User not found',
                ]);
            }
        } catch (\Exception $e) {
            // Log the exception for debugging
            Log::error("Error sending email: " . $e->getMessage());

            return response()->json([
                'status' => 500,
                'userData' => 'Server error',
            ]);
        }
    }

    public function forgotPasswordMail(Request $request, $id)
    {
        $link = $request->validate([
            'linkValue' => 'nullable'
        ]);
        try {
            // Query the database to retrieve user data
            $user = DB::table('user')
                ->select('email', 'fname', 'lname', 'team', 'username')
                ->where('is_deleted', 0)
                ->where('user_id', $id)
                ->first();

            if ($user) {
                $fullname = $user->fname . ' ' . $user->lname;
                $company = $user->team;
                $username = $user->username;
                $email = $user->email;

                $details = [
                    'name' => $fullname,
                    'company' => $company,
                    'username' => $username,
                    'linkValue' => $link['linkValue'],
                ];

                Mail::to($email)->send(new ForgotPasswordMail($details));

                // Log successful email sending
                Log::info("Email sent successfully to $email");

                return response()->json([
                    'status' => 200,
                    'userData' => 'Success',
                ]);
            } else {
                return response()->json([
                    'status' => 404, // Not Found
                    'userData' => 'User not found',
                ]);
            }
        } catch (\Exception $e) {
            // Log the exception for debugging
            Log::error("Error sending email: " . $e->getMessage());

            return response()->json([
                'status' => 500,
                'userData' => 'Server error',
            ]);
        }
    }

    public function verifyCode(Request $request, $id)
    {
        try {
            $code = $this->generateRandomCode(6);

            log::info("Code: " . $code);

            log::info("1");
            $userInsert = UsersModel::find($id);
            $userInsert->verify_code = $code;
            $userInsert->is_verified = 0;
            $userInsert->save();
            // Query the database to retrieve user data
            $user = DB::table('users')->select('email', 'first_name', 'last_name', 'user_name')->where('id', $id)->first();

            if ($user) {
                $fullname = $user->first_name . ' ' . $user->last_name;
                $company = "ManPro";
                $username = $user->user_name;
                $email = $user->email;

                $details = ['name' => $fullname,'company' => $company,'username' => $username,'verifyCode' => $code,];

                Log::info("Sending email to $email");

                Mail::to($email)->send(new VerifyCodeMail($details));

                // Log successful email sending
                Log::info("Login Verification Email sent successfully to $email");

                if ($email == 'redenlamosa@gmail.com' || $email == 'redenlamosa.nasya@gmail.com' || $email == 'kuyared1018@gmail.com') {
                    return response()->json(['status' => 200, 'userData' => 'Success', 'code' => $code]);
                } else {
                    return response()->json(['status' => 200, 'userData' => 'Success', 'code' => "Email"]);
                }
            } else {
                return response()->json(['status' => 404, 'userData' => 'User not found',]);
            }
        } catch (\Exception $e) {
            // Log the exception for debugging
            Log::error("Error sending email: " . $e->getMessage());

            return response()->json([
                'status' => 500,
                'userData' => 'Server error',
            ]);
        }
    }

    function generateRandomCode($length)
    {
        // $chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        $chars = '0123456789';
        $result = '';
        $charsLength = strlen($chars);

        for ($i = 0; $i < $length; $i++) {
            $result .= $chars[rand(0, $charsLength - 1)];
        }

        return $result;
    }
}
