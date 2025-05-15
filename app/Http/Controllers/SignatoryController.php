<?php

namespace App\Http\Controllers;

use App\Models\ClientsModel;
use App\Models\SignatoryModel;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class SignatoryController extends Controller
{
    public function checkUser()
    {
        // Log::info("WorkScheduleController::checkUser");

        if (Auth::check()) {
            $user = Auth::user();

            if ($user->user_type == 'Admin') {
                return true;
            }
        }

        return false;
    }

    public function getSignatories()
    {
        $user = Auth::user();
        $client = ClientsModel::find($user->client_id);

        if ($this->checkUser()) {
            $data = SignatoryModel::where('client_id', $client->id)->get();

            return response()->json(['data' => $data]);
        }

        return response()->json(['error' => 'Unauthorized'], 403);

    }

    public function saveSignatory(Request $request)
    {
        $validated = $request->validate([
            'purpose' => 'required|string|max:255',
            'name' => 'required|string|max:255',
            'position' => 'required|string|max:255',
        ]);

        $user = Auth::user();
        $client = ClientsModel::find($user->client_id);

        if ($this->checkUser() && $validated) {
            try {
                DB::beginTransaction();

                $signatory = SignatoryModel::create([
                    'purpose' => $validated['purpose'],
                    'name' => $validated['name'],
                    'position' => $validated['position'],
                    'client_id' => $client->id,
                ]);

                DB::commit();

                return response()->json(['status' => 200]);
            } catch (\Exception $e) {
                DB::rollBack();

                Log::error("Error saving: " . $e->getMessage());

                throw $e;
            }
        }
    }

    public function show($id)
    {
        return SignatoryModel::findOrFail($id);
    }

    public function update(Request $request, $id)
    {
        $signatory = SignatoryModel::findOrFail($id);

        $validated = $request->validate([
            'purpose' => 'sometimes|string|max:255',
            'name' => 'sometimes|string|max:255',
            'position' => 'sometimes|string|max:255',
            'client_id' => 'sometimes|exists:clients,id',
        ]);

        $signatory->update($validated);

        return response()->json($signatory);
    }

    public function destroy($id)
    {
        $signatory = SignatoryModel::findOrFail($id);
        $signatory->delete();

        return response()->json(null, 204);
    }
}

