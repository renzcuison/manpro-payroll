<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\RoundedPerimeterModel;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use App\Models\ClientsModel;
use Illuminate\Support\Facades\Log;

class RadiusPerimeterController extends Controller
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

    public function saveRadiusPerimeter(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255|unique:rounded_perimeters,name',
            'radius' => 'required|numeric|min:1',
            'latitude' => 'required|string|max:255',
            'longitude' => 'required|string|max:255',
            'location_name' => 'nullable|string|max:255',
            'status' => 'nullable|string|max:100',
        ]);

        $user = Auth::user();
        $client = ClientsModel::find($user->client_id);

        if ($this->checkUser() && $validated) {

            try {
                DB::beginTransaction();

                $perimeter = RoundedPerimeterModel::create([
                    'name' => $validated['name'],
                    'radius' => $validated['radius'],
                    'latitude' => $validated['latitude'],
                    'longitude' => $validated['longitude'],
                    'location' => $validated['location_name'],
                    'status' => $validated['status'],
                    'client_id' => $client->id,
                ]);

                DB::commit();

                return response()->json(['status' => 200, 'data' => $perimeter], 200);

            } catch (\Exception $e) {
                DB::rollBack();

                Log::error("Error saving: " . $e->getMessage());

                throw $e;
            }
        }
    }

    // List all perimeters
    public function getRadiusPerimeters(Request $request)
    {

        $user = Auth::user();
        $client = ClientsModel::find($user->client_id);

        if($this->checkUser()) {
            $perimeters = RoundedPerimeterModel::where('client_id', $client->id)->get();

            return response()->json(['perimeters' => $perimeters]);
        } else {
            return response()->json(['message' => 'Unauthorized'], 403);

        }

        $perimeters = RoundedPerimeterModel::all();

        return response()->json($perimeters);
    }

    // Show a single perimeter
    public function show($id)
    {
        $perimeter = RoundedPerimeterModel::findOrFail($id);

        return response()->json($perimeter);
    }

    // Update a perimeter
    public function update(Request $request, $id)
    {
        $perimeter = RoundedPerimeterModel::findOrFail($id);

        $validated = $request->validate([
            'name' => 'sometimes|required|string|max:255',
            'radius' => 'sometimes|required|numeric|min:1',
            'latitude' => 'sometimes|required|numeric|between:-90,90',
            'longitude' => 'sometimes|required|numeric|between:-180,180',
            'location_name' => 'nullable|string|max:255',
            'status' => 'nullable|string|max:100',
        ]);

        $perimeter->update($validated);

        return response()->json([
            'message' => 'Perimeter updated successfully',
            'data' => $perimeter
        ]);
    }

    // Delete a perimeter
    public function destroy($id)
    {
        $perimeter = RoundedPerimeterModel::findOrFail($id);
        $perimeter->delete();

        return response()->json([
            'message' => 'Perimeter deleted successfully'
        ]);
    }

    public function getPerimeterbyUser()
    {
        $user = Auth::user();
        
        if (!$user) {
            return response()->json(['message' => 'Unauthorized'], 401);
        }

        try {
            // Get perimeters based on user's client_id
            $perimeters = RoundedPerimeterModel::where('client_id', $user->client_id)
                ->where('status', 'Active')  // Only get active perimeters
                ->select(['id', 'name', 'radius', 'latitude', 'longitude', 'location'])
                ->get();

            return response()->json([
                'status' => 200,
                'perimeters' => $perimeters
            ]);

        } catch (\Exception $e) {
            Log::error("Error fetching perimeters: " . $e->getMessage());
            return response()->json([
                'message' => 'Error fetching perimeters',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
