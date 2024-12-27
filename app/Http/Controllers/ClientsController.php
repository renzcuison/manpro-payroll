<?php

namespace App\Http\Controllers;

use App\Models\UsersModel;
use App\Models\ClientsModel;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Auth;

class ClientsController extends Controller
{
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
        // log::info("ClientsController::saveClient");

        if ($this->checkUser()) {
            try {
                DB::beginTransaction();

                $client = ClientsModel::create([
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

                log::info($client);
                log::info($admin);

                DB::commit();
            
                return response()->json([ 'status' => 200 ]);

            } catch (\Exception $e) {
                DB::rollBack();

                Log::error("Error saving: " . $e->getMessage());

                throw $e;
            }
        }    
    }
}
