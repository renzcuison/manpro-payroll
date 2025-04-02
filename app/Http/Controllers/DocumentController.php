<?php

namespace App\Http\Controllers;

use App\Models\Document;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Auth;

class DocumentController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $documents = Document::with('media')->get();

        return response()->json([
            'data' => $documents,
            'message' => 'Document list retrieved successfully.',
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        //
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        try {
            $user_id = Auth::id();
            $request->validate([
                'title' =>'required|string',
                'description' =>'required|string',
                'file' => 'required|file|mimes:jpeg,png,jpg,pdf,csv,docx,doc'
            ]);

            $document = new Document();
            $document->title = $request->title;
            $document->user_id = $user_id;
            $document->description = $request->description;
            
            // if file exists then store file using spatie media library
            if ($request->hasFile('file')) {
                $document->addMediaFromRequest('file')->toMediaCollection('documents');
            }
            $document->save();

            return response()->json([
                'document' => $document,
            'message' => 'Document created successfully.',
            ], 201);
        } catch (\Throwable $th) {
            return response()->json([
                'error' => 'An error occurred while creating the document.',
                'details' => $th->getMessage(),
            ], 500);
        }
    }

    /**
     * Display the specified resource.
     */
    public function show(Document $document)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Document $document)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Document $document)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Document $document)
    {
        //
    }
}