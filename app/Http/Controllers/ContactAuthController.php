<?php

namespace App\Http\Controllers;

use Exception;

use App\Models\User;
use App\Models\Contact;
use App\Models\ContactSocial;

use Illuminate\Support\Str;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Auth;

use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Lcobucci\JWT\JwtFacade;
use Tymon\JWTAuth\Facades\JWTAuth;

class ContactAuthController extends Controller
{

    public function index(Request $request)
    {
        $contact_user = $request->user();
        $social_accounts = ContactSocial::where("social_contact_id", $contact_user->contact_id)->get();
        $contact_user->social_accounts = $social_accounts;
        $contact_user->id = $contact_user->contact_id;
        $contact_user->token = $request->bearerToken();

        return [ 'user' => $contact_user ];
    }

    public function login(Request $request)
    {
        $fields = $request->validate([
            'username' => 'required|string',
            'contact_password' => 'required|string'
        ]);

        $contact_user = Contact::where(function ($query)
        use ($fields) {
            $query->where('username', '=', $fields['username'])
                ->orWhere('contact_email', '=', $fields['username']);
        })
            ->where('contact_password', '=', $fields['contact_password'])
            ->where('is_removed', 0)
            // ->toSql();
            ->first();

        // dd($contact_user);

        if ($contact_user) {
            $social_accounts = ContactSocial::where("social_contact_id", $contact_user->contact_id)->get();

            $token = $contact_user->createToken('contactAppToken')->plainTextToken;
            $contact_user->id = $contact_user->contact_id;
            $contact_user->token = $token;
            $contact_user->social_accounts = $social_accounts;
            $response = [
                'success' => 1,
                'user' => $contact_user
            ];


            return response($response, 200);
        }

        return response([
            "success" => 0,
        ]);
    }

    public function signup(Request $request)
    {
        $fields = $request->validate([
            'contact_fname' => 'required|string',
            'contact_mname' => 'required|string',
            'contact_lname' => 'required|string',
            'username' => 'required|string',
            'contact_cpnum' => 'required|integer',
            'contact_email' => 'required|string|unique:contact,contact_email',
            'contact_password' => 'required|string'
        ]);

        $contact_user = Contact::create($fields);

        if ($contact_user) {
            $token = $contact_user->createToken('contactAppToken')->plainTextToken;
            $contact_user->token = $token;
            $contact_user->id = $contact_user->contact_id;
            $contact_user->social_accounts = [];
            $contact_user->contact_bdate = date('Y-m-d H:i:s');

            $response = [
                'success' => 1,
                'user' => $contact_user
            ];
            return response($response, 201);
        }

        return response([
            "success" => 0
        ], 200);
    }

    public function getVerificationCode(Request $request)
    {
        // $userId = Auth::id();
        $userId = $request->input('userId');

        Log::info($request);

        Log::info("getVerificationCode()");
        Log::info("User ID: " . $userId);

        try {
            $user = User::findOrFail($userId);
            $verificationCode = $user->verify_code;
            $status = "Success";
            $verified = $user->is_verified;

            Log::info("Verification Code: " . $verificationCode);
            Log::info("User ID: " . $user->user_id);
            Log::info("Status: " . $status);

            return response()->json(['verify_code' => $verificationCode, 'userId' => $userId, 'status' => $status, 'verified' => $verified], 200);
        } catch (Exception $e) {
            Log::error('Error fetching verification code:', ['error' => $e->getMessage()]);
            return response()->json(['status' => 'Error', 'message' => 'An error occurred'], 500);
        }
    }

    public function verifyVerificationCode(Request $request)
    {
        try {
            $userId = $request->input('userId');
            $user = User::findOrFail($userId);
            $user->is_verified = 0;
            $user->save();

            $status = "Success";
            $verified = $user->is_verified;

            Log::info("User ID: " . $user->user_id);
            Log::info("Status: " . $status);

            return response()->json(['userId' => $user->user_id, 'status' => $status, 'verified' => $verified], 200);
        } catch (Exception $e) {
            Log::error('Error fetching verification code:', ['error' => $e->getMessage()]);
            return response()->json(['status' => 'Error', 'message' => 'User not found or other error'], 500);
        }
    }

    public function forgotPasswordAction(Request $request)
    {
        $fields = $request->validate([
            'email' => 'required|email'
        ]);

        $code = rand(1000, 99999);

        $user = Contact::where('contact_email', $fields['email'])->first();
        Contact::where('contact_email', $fields['email'])->update(['change_pass_code' => $code]);
        if ($user->count() > 0) {
            Mail::send([], [], function ($message) use ($code, $fields, $user) {
                $base_url = 'https://nasyaportal.ph';
                // $base_url = 'http://localhost/Nasya';
                $message->to($fields['email'], 'Nasya')
                    ->subject('Forgot Password')
                    ->setBody('<div style="margin: 10px 5% 10px;background-color: #008018; border-radius: 10px; padding: 5px 5px 5px;">
				<div style="justify-content: center; align-items: center; text-align: center; margin: 10px">
						<img src="https://nasyaportal.ph/assets/media/photos/home-logo.png" style="width: 7%; border: 3px solid white; border-radius: 70px">
				</div>
				<div style="background-color: white">
						<div class="parent" style="overflow: hidden; display: flex; align-items: center; justify-content: center; padding: 5px">
								<img src="https://nasyaportal.ph/assets/media/photos/scheduling.jpg" style="width: 100%;">
						</div>
						<table width="100%" border="0" cellspacing="0" cellpadding="20" style=" color: #5a5f61; font-family:verdana;">
								<tr>
										<td style="">
												<p style="margin-top: -5px;">Hi ' . $user->contact_fname . ' ' . $user->contact_lname . '</p>

												<div style="text-align: justify; ">Thank you for choosing <b>NASYA BUSINESS CONSULTANCY SERVICES</b></div><div style="text-align: justify;"><br></div><div style="text-align: justify;"><b>Your Innovative Medical Partner In Life</b></div><div style="text-align: justify;"><br></div><div style="text-align: justify;"><br></div><div style="text-align: justify; ">Greetings from <b>Nasya</b>!&nbsp;</div><div style="text-align: justify;"><br></div><div style="text-align: justify;">If you didn\'t requested changing password, please ignore this email, Thank you!.</div><div style="text-align: justify;"><br></div><div style="text-align: justify;">Please click the link below to change password.</div><div style="text-align: justify;"><br></div><div style="text-align: justify;"><a href="' . $base_url . '/client/forgot_password.php?change_pass=' . $fields['email'] . '&code=' . $code . '">Change Password</a>.</div><div style="text-align: justify;"><br></div><div style="text-align: justify;">&nbsp;</div><div style="text-align: justify;">Sincerely</div><div style="text-align: justify;">Nasya Team</div>
										</td>
								</tr>
						</table>
						<div style="text-align: center; padding: 20px 0px; color: #fff; background-color: #008018; font-family:verdana">
								Your Innovative Medical Partner In Life<br>
								support@nasya.ph<br>
								<a href="https://nasyaportal.ph/client/" style="color: white;">https://nasyaportal.ph/client/</a>
						</div>
				</div>
		</div>', 'text/html');
            });
        }

        return response([
            "message" => $user,
        ], 200);
    }

    public function verifyEmail(Request $request)
    {
        $fields = $request->validate([
            'email' => 'required|email'
        ]);

        $user = User::where('email', $fields['email'])->first();

        return response([
            "message" => $user ? 'Success' : '',
            "user_id" => $user ? $user->user_id : '',
            "pass" => $user ? $user->password : '',
        ], 200);
    }

    public function updateProfile(Request $request)
    {
        $fields = array_filter($request->all(), 'strlen');
        Contact::where('contact_id', $request->user()->contact_id)->update($fields);
        return response($fields);
    }

    public function deleteAccount(Request $request)
    {

        $delete = Contact::where('contact_id', $request->user()->contact_id)->update(["is_removed" => 1]);

        if (!$delete) {
            return response([
                'success' => false
            ]);
        }

        return response([
            'success' => true
        ]);
    }

    public function addPushToken(Request $request)
    {
        $fields = $request->validate([
            'pushToken' => 'required'
        ]);
        $user = auth()->user();

        $user = User::findOrFail($user->user_id);
        $user->push_token = $fields['pushToken'];
        $user->save();

        return $user;
    }

    // public function addPushToken(Request $request)
    // {
    //     $fields = $request->validate([
    //         'pushToken' => 'required'
    //     ]);
    //     $userId = auth()->user();
    //     $userId = $userId->user_id;

    //     $user = User::findOrFail($userId);
    //     $user->push_token = $fields['pushToken'];
    //     $user->save();

    //     return $user;
    // }


    public function facebook(Request $request)
    {
        $fields = $request->validate([
            "access_token" => "required|string"
        ]);
        $response = Http::withHeaders([
            "Content-Type" => "application/json",
        ])->get("https://graph.facebook.com/me?fields=id,name,email,picture&access_token=" . $fields['access_token']);

        $body = json_decode($response->body());

        if (property_exists($body, "error")) {
            return response([
                "success" => 0
            ], 500);
        }

        $findUser = Contact::join("contact_socials", "contact_socials.social_contact_id", "=", "contact.contact_id")
            ->where([
                ["contact_fbname", $body->name],
                ["contact_socials.social_provider", "facebook"],
                ["contact_socials.is_unlinked", 0]
            ])->first();

        // If user already linked google account, authorize
        if ($findUser !== null) {
            $social_accounts = ContactSocial::where("social_contact_id", Contact::raw($findUser->contact_id))->get();
            $findUser->social_accounts = $social_accounts;
            $findUser->id = $findUser->contact_id;
            $findUser->token = $findUser->createToken('contactAppToken')->plainTextToken;
            $response = [
                'success' => 1,
                'user' => $findUser
            ];
            return response($response, 200);
        }

        // Create a brand new user
        $pool = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
        $split_name = explode(" ", $body->name);
        $newUser = [
            "username" => str_replace(" ", "", strtolower($body->name)) . substr(str_shuffle(str_repeat($pool, 5)), 0, rand(1, 6)),
            "contact_fname" => $split_name[0],
            "contact_mname" => "",
            "contact_lname" => end($split_name),
            "contact_fbname" => $body->name
        ];

        $createdUser = Contact::create($newUser);

        if ($createdUser) {
            $social_accounts = ContactSocial::create([
                "social_provider_id" => $body->id,
                "social_provider" => "facebook",
                "social_contact_id" => $createdUser->contact_id,
            ]);
            $createdUser->id = $createdUser->contact_id;
            $createdUser->token = $createdUser->createToken('contactAppToken')->plainTextToken;
            $createdUser->social_accounts = [$social_accounts];
            $createdUser->contact_bdate = date('Y-m-d H:i:s');

            return response([
                "success" => 1,
                "user" => $createdUser
            ]);
        }


        return response([
            "success" => 0
        ], 500);
    }

    public function linkFacebookAccount(Request $request)
    {
        $fields = $request->validate([
            "access_token" => "required|string"
        ]);
        $response = Http::withHeaders([
            "Content-Type" => "application/json",
            "Authorization" => $fields["tokenType"] . " " . $fields["accessToken"],
        ])->get("https://graph.facebook.com/me?fields=id,name,email,picture&access_token=" . $fields['access_token']);

        $user = $request->user();
        $contact_id = $user->contact_id;
        $body = json_decode($response->body());
        if (property_exists($body, "error")) {
            return response([
                "success" => 0
            ], 500);
        }

        Contact::where("contact_id", Contact::raw($contact_id))->update(["contact_fbname" => $body->name]);

        $social_accounts = ContactSocial::firstOrCreate([
            "social_provider_id" => $body->id,
            "social_provider" => "facebook",
            "social_contact_id" => $contact_id,
        ]);

        return response([
            "social_accounts" => $social_accounts
        ], 201);
    }

    public function apple(Request $request)
    {

        try {
            $fields = $request->validate([
                "identityToken" => "required|string",
                "givenName" => "required|string",
                "familyName" => "required|string"
            ]);

            $tokenParts = explode(".", $fields['identityToken']);
            $tokenHeader = base64_decode($tokenParts[0]);
            $tokenPayload = base64_decode($tokenParts[1]);
            $jwtHeader = json_decode($tokenHeader);
            $body = json_decode($tokenPayload);
            $apple_id = $body->email;
            // print $jwtPayload->username;

            $findUserByAppleId = Contact::leftJoin('contact_socials', function ($join) {
                $join->on('contact_socials.social_contact_id', 'contact.contact_id')
                    ->where([
                        ['contact_socials.social_provider', 'google'],
                        ['contact_socials.is_unlinked', 0]
                    ]);
            })
                ->where('contact.apple_id', $apple_id)
                ->first();

            if ($findUserByAppleId) {
                $findUserByAppleId->token = $findUserByAppleId->createToken('contactAppToken')->plainTextToken;
                $findUserByAppleId->id = $findUserByAppleId->contact_id;

                if ($findUserByAppleId->social_provider_id) {
                    $social_accounts = ContactSocial::where("social_contact_id", Contact::raw($findUserByAppleId->contact_id))->get();
                    $findUserByAppleId->social_accounts = $social_accounts;
                } else {
                    $social_accounts = ContactSocial::create([
                        "social_provider_id" => "",
                        "social_provider" => "apple",
                        "social_contact_id" => $findUserByAppleId->contact_id,
                    ]);
                    $findUserByAppleId->social_accounts = [$social_accounts];
                }

                return response([
                    "success" => 1,
                    "user" => $findUserByAppleId
                ]);
            } else {
                $pool = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
                $newUser = [
                    "username" => str_replace(" ", "", strtolower($fields['givenName'])) . substr(str_shuffle(str_repeat($pool, 5)), 0, rand(1, 6)),
                    "contact_fname" => $fields['givenName'],
                    "contact_mname" => "",
                    "contact_lname" => $fields['familyName'],
                    "apple_id" => $apple_id
                ];

                $createdUser = Contact::create($newUser);

                if ($createdUser) {
                    $social_accounts = ContactSocial::create([
                        "social_provider_id" => "",
                        "social_provider" => "apple",
                        "social_contact_id" => $createdUser->contact_id,
                    ]);
                    $createdUser->id = $createdUser->contact_id;
                    $createdUser->token = $createdUser->createToken('contactAppToken')->plainTextToken;
                    $createdUser->social_accounts = [$social_accounts];
                    $createdUser->contact_bdate = date('Y-m-d H:i:s');

                    return response([
                        "success" => 1,
                        "user" => $createdUser
                    ]);
                }
            }

            return response([
                "response" => "User not created",
            ]);
        } catch (\Throwable $th) {
            return response([
                'Server Error' => $th->getMessage(),
            ]);
        }
    }

    public function google(Request $request)
    {
        $fields = $request->validate([
            "accessToken" => "required|string",
            "tokenType" => "required|string"
        ]);
        $googleEndpoint = "https://www.googleapis.com/userinfo/v2/me";
        $response = Http::withHeaders([
            "Content-Type" => "application/json",
            "Authorization" => $fields["tokenType"] . " " . $fields["accessToken"],
        ])->get($googleEndpoint);
        $body = json_decode($response->body());

        if (property_exists($body, "error")) {
            return response([
                "success" => 0
            ], 500);
        }

        $findUserByEmail = Contact::leftJoin('contact_socials', function ($join) {
            $join->on('contact_socials.social_contact_id', 'contact.contact_id')
                ->where([
                    ['contact_socials.social_provider', 'google'],
                    ['contact_socials.is_unlinked', 0]
                ]);
        })
            ->where('contact.contact_email', $body->email)
            ->first();

        if ($findUserByEmail) {
            $findUserByEmail->token = $findUserByEmail->createToken('contactAppToken')->plainTextToken;
            $findUserByEmail->id = $findUserByEmail->contact_id;

            if ($findUserByEmail->social_provider_id) {
                $social_accounts = ContactSocial::where("social_contact_id", Contact::raw($findUserByEmail->contact_id))->get();
                $findUserByEmail->social_accounts = $social_accounts;
            } else {
                $social_accounts = ContactSocial::create([
                    "social_provider_id" => $body->id,
                    "social_provider" => "google",
                    "social_contact_id" => $findUserByEmail->contact_id,
                ]);
                $findUserByEmail->social_accounts = [$social_accounts];
            }

            return response([
                "success" => 1,
                "user" => $findUserByEmail
            ]);
        } else {
            // Create a brand new user
            $pool = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
            $newUser = [
                "username" => str_replace(" ", "", strtolower($body->given_name)) . substr(str_shuffle(str_repeat($pool, 5)), 0, rand(1, 6)),
                "contact_fname" => $body->given_name,
                "contact_mname" => "",
                "contact_lname" => $body->family_name,
                "contact_email" => $body->email
            ];

            $createdUser = Contact::create($newUser);

            if ($createdUser) {
                $social_accounts = ContactSocial::create([
                    "social_provider_id" => $body->id,
                    "social_provider" => "google",
                    "social_contact_id" => $createdUser->contact_id,
                ]);
                $createdUser->id = $createdUser->contact_id;
                $createdUser->token = $createdUser->createToken('contactAppToken')->plainTextToken;
                $createdUser->social_accounts = [$social_accounts];
                $createdUser->contact_bdate = date('Y-m-d H:i:s');

                return response([
                    "success" => 1,
                    "user" => $createdUser
                ]);
            }
        }

        return response([
            "success" => 0
        ], 500);
    }

    public function linkGoogleAccount(Request $request)
    {
        $fields = $request->validate([
            "accessToken" => "required|string",
            "tokenType" => "required|string"
        ]);

        $googleEndpoint = "https://www.googleapis.com/userinfo/v2/me";

        $response = Http::withHeaders([
            "Content-Type" => "application/json",
            "Authorization" => $fields["tokenType"] . " " . $fields["accessToken"],
        ])->get($googleEndpoint);

        $user = $request->user();
        $contact_id = $user->contact_id;
        $body = json_decode($response->body());

        if (property_exists($body, "error")) {
            return response([
                "success" => 0
            ], 500);
        }

        if ($body->email != $user->contact_email) {
            return response([], 406);
        }

        $social_accounts = ContactSocial::firstOrCreate([
            "social_provider_id" => $body->id,
            "social_provider" => "google",
            "social_contact_id" => $contact_id,
        ]);

        return response([
            "social_accounts" => $social_accounts
        ], 201);
    }

    public function getUserDetailsById($userId)
    {
        $user = Contact::where('contact_id', Contact::raw($userId))->first();

        if ($user->count() > 0) {
            $user->social_accounts = [];
            $user->id = $user->contact_id;
            return response([
                "user" => $user
            ]);
        }

        return response(["user" => []], 404);
    }

    public function imageUpload(Request $request)
    {

        // if ($request->hasFile('photo')) {
        // 	return response(["photo" => $request->file('photo')]);
        // }
        $request->validate([
            "photo" => 'required'
        ]);

        return response([
            "status" => $request->file('photo')->guessExtension(),
        ]);
    }
}
