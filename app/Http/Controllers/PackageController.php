<?php

namespace App\Http\Controllers;

use App\Models\Feature;
use App\Models\Package;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Response;

class PackageController extends Controller
{
    /**
     * Return a json listing of the resource.
     */
     public function index(): JsonResponse
     {
         $packages = Package::all();
         return response()->json($packages->load('features'));
     }

    /**
     * Show the form for creating a new resource.
     */
    public function create(): JsonResponse
    {
        //
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request): JsonResponse
    {
        $package = Package::create($request->all());
        return response()->json($package->load('features'), 201);
    }

    /**
     * Display the specified resource.
     */
    public function show($id): JsonResponse
    {
        $package = Package::with('features')->find($id);
        return response()->json($package);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Package $package): JsonResponse
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, $id): JsonResponse
    {
        try {
            // Validate the request
            $validatedData = $request->validate([
                'name' => 'required',
                'description' => 'required',
                'price' => 'required|numeric',
                ]);
            // Update the package
            $package = Package::find($id);
            $package->update($validatedData);
            
            return response()->json($package, 200);
        } catch (\Throwable $th) {
            return response()->json(['error' => $th->getMessage()], 400);
        }
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy($id): JsonResponse
    {
        try {
            
            $package = Package::find($id);
            $package->features()->delete();
            $package->delete();
            return response()->json(['message' => 'Package deleted successfully'], 200);

        } catch (\Throwable $th) {
            return response()->json(['error' => $th->getMessage()], 400);
        }
    }

    /**
     * Assign feature to package.
     */
    public function assignFeature(Request $request, $id): JsonResponse
    {
        try {
            $package = Package::find($id);
            $feature = Feature::find($request->feature_id);

            // Check if the feature is already attached to the package
            if ($package->features()->where('feature_id', $feature->id)->exists()) {
                
                $package->features()->detach($feature);
                return response()->json([
                    'success' => true,
                    'message' => 'Feature unassigned successfully',
                    'data' => $package->load('features')
                ], 200);
                    
            }

            $package->features()->attach($feature);
            
            return response()->json([
                'success' => true,
                'message' => 'Feature assigned successfully',
                'data' => $package->load('features')], 200);
        } catch (\Throwable $th) {
            return response()->json(['error' => $th->getMessage()], 400);
        }
    }
}