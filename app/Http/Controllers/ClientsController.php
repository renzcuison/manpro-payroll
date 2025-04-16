<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreClientRequest;
use App\Models\UsersModel;
use App\Models\ClientsModel;
use App\Models\Company;
use App\Models\Package;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\ValidationException;

class ClientsController extends Controller
{
    public function index(): JsonResponse
    {
        $clients = UsersModel::with('company.package')->get();
        return response()->json($clients);
    }

    public function show($id): JsonResponse
    {
        $client = UsersModel::find($id);
        
        if (!$client) {
            return response()->json(['error' => 'Client not found'], 404);
        }
        
        return response()->json($client->load('company.package'));
    }

    public function update(Request $request, $id): JsonResponse
    {
        try {
            $validated = $request->validate([
                'firstname' => 'required',
                'middlename' => 'required',
                'lastname' => 'required',
                'email' => 'required|email|unique:users,email,' . $id,
                'username' => 'required|unique:users,user_name,' . $id,
                'contact_number' => 'required',
                'address' => 'required',
                'password' => 'nullable|min:6',
                'confirm_password' => 'nullable|same:password',
            ]);

            $client = UsersModel::findOrFail($id);

            $client->first_name = $validated['firstname'];
            $client->middle_name = $validated['middlename'];
            $client->last_name = $validated['lastname'];
            $client->user_name = $validated['username'];
            $client->email = $validated['email'];
            $client->contact_number = $validated['contact_number'];
            $client->address = $validated['address'];

            if (!empty($validated['password'])) {
                $client->password = Hash::make($validated['password']);
            }

            $client->save();

            return response()->json([
                'isSuccess' => true,
                'message' => 'Client updated successfully',
                'client' => $client,
            ], 200);

        } catch (ValidationException $e) {
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $e->errors(),
            ], 422);
        } catch (\Throwable $th) {
            Log::error($th->getMessage());
            return response()->json([
                'message' => 'Error updating client',
                'error' => $th->getMessage(),
            ], 500);
        }
    }


    public function store(Request $request): JsonResponse
    {
        try {
            $validated = $request->validate([
                'firstname' => 'required',
                'middlename' => 'required',
                'lastname' => 'required',
                'email' => 'required|email|unique:users,email',
                'username' => 'required|unique:users,user_name',
                'contact_number' => 'required',
                'address' => 'required',
                'password' => 'required',
                'confirm_password' => 'required|same:password',
            ]);

            $client = new UsersModel();
            $client->first_name = $validated['firstname'];
            $client->middle_name = $validated['middlename'];
            $client->last_name = $validated['lastname'];
            $client->user_name = $validated['username'];
            $client->email = $validated['email'];
            $client->password = Hash::make($validated['password']);
            $client->contact_number = $validated['contact_number'];
            $client->address = $validated['address'];
            $client->user_type = "Admin";
            $client->save();

            return response()->json([
                'isSuccess' => true,
                'message' => 'Client created successfully',
                'client' => $client,
            ], 201);

        } catch (ValidationException $e) {
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $e->errors()
            ], 422);
        } catch (\Throwable $th) {
            Log::error($th->getMessage());
            return response()->json([
                'message' => 'Error creating client',
                'error' => $th->getMessage(),
            ], 500);
        }
    }

    public function assignPackageToCompany(Request $req, $id, $pkg_id)
    {
        try {
            
            $company = Company::findOrFail($id);
            $package = Package::findOrFail($pkg_id);
            
            $company->package_id = $package->id;
            $company->save();

            return response()->json([
                'isSuccess' => true,
                'message' => 'Package assigned successfully',
                'company' =>$company->load('package')
        ], 200);
        } catch (\Throwable $th) {
            Log::error($th->getMessage());
            return response()->json([
                'message' => 'Error assigning package',
                'error' => $th->getMessage(),
            ], 500);
        }
    }
    
    public function checkUser()
    {
        // Log::info("ClientsController::checkUser");

        if (Auth::check()) {
            $user = Auth::user();

            if ($user->user_type == 'SuperAdmin') {
                return true;
            }
        }

        return false;
    }

    function generateRandomCode($length)
    {
        $chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        $result = '';
        $charsLength = strlen($chars);

        for ($i = 0; $i < $length; $i++) {
            $result .= $chars[rand(0, $charsLength - 1)];
        }

        return $result;
    }

    public function getClients(Request $request)
    {
        // Log::info("ClientsController::getClients");

        if ($this->checkUser()) {
            $clients = ClientsModel::get();

            return response()->json(['status' => 200, 'clients' => $clients]);
        }

        return response()->json(['status' => 200, 'clients' => null]);
    }
    public function saveClient(Request $request)
    {
        // Log::info("ClientsController::saveClient");

        if ($this->checkUser()) {
            try {
                DB::beginTransaction();

                $code = $this->generateRandomCode(8);

                // while (ClientsModel::where('unique_code', $code)->exists()) {
                    // $code = $this->generateRandomCode(8);
                // }

                $client = ClientsModel::create([
                    // "unique_code" => $code,
                    "name" => $request->clientName,
                    "package" => $request->selectedPackage,
                ]);
        
                $password = Hash::make($request->password);
        
                $admin = UsersModel::create([
                    "user_name" => $request->userName,
                    "first_name" => $request->firstName,
                    "middle_name" => $request->middleName,
                    "last_name" => $request->lastName,
                    "suffix" => $request->suffix,
                    // "birth_date" => $request->selectedPackage,
        
                    "address" => $request->address,
                    "contact_number" => $request->phoneNumber,
                    "email" => $request->emailAddress,
                    "password" => $password,
        
                    "user_type" => "Admin",
                    "client_id" => $client->id,
                ]);

                DB::commit();
            
                return response()->json([ 'status' => 200 ]);

            } catch (\Exception $e) {
                DB::rollBack();

                Log::error("Error saving: " . $e->getMessage());

                throw $e;
            }
        }    
    }

    public function storeCompany(Request $request): JsonResponse
    {
        try {
            
            $validated = $request->validate([
                'user_id' => 'required',
                'name' => 'required',
                'email' => 'required|unique:companies,email',
                'phone' => 'required|unique:companies,phone',
                'address' => 'required',
                'website' => 'required',
                'description' => 'required',
            ]);
            
            $company = new Company();
            $company->user_id = $request->user_id;
            $company->name = $request->name;
            $company->email = $request->email;
            $company->phone = $request->phone;
            $company->address = $request->address;
            $company->website = $request->website;
            $company->description = $request->description;
            $company->save();

            return response()->json([ 'company' => $company, 'status' => 200 ]);

        } catch (ValidationException $e) 
        {
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $e->errors()
        ], 422);} catch (\Throwable $th) 
        {
            Log::error("Error saving company: " . $th->getMessage());
            return response()->json([ 'error' => 'Error saving company', 'status' =>
            500 ], 500);
        }
    }
}