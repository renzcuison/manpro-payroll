<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\MySupport;
use Illuminate\Support\Facades\DB;

class MySupportController extends Controller
{
    public function create(Request $request)
    {
		$fields = $request->validate([
            'title' => 'required|string',
            'description' => 'required|string',
            'added_by_user_id' => 'required|int',
        ]);

        $my_support = MySupport::create($fields);

        if ($my_support) {
            return response([
                'res' => 'success',
                'data' => $my_support
            ]);
        }
        // dd($request);
        return response([
            'res' => 'failed'
        ]);
    }

    public function show($id){
        $my_support = MySupport::findOrFail($id);
        $files = DB::table('tbl_my_support_files')->where('my_supports_id', $id)->get();

        return response()->json([
            'data' => $my_support,
            'files' => $files
        ]);
    }

    public function update(Request $request, $id){
        $fields = $request->validate([
            'title' => 'required|string',
            'description' => 'required|string'
        ]);
        $my_support = MySupport::findOrFail($id);
        $my_support->update($fields);
        return response($my_support);
    }

    public function delete($id){
        $my_support = MySupport::findOrFail($id);
        $my_support->delete();
        
        if(!$my_support){
            return response(['success' => false]);
        }

        return response([
            'success' => true,
            'data' => $my_support
        ]);
    }

    //create update function in laravel 8

    public function getMySupport(){

        $data = MySupport::all();
        // dd($data);
        foreach ($data as $key => $value) {
            $id = $value->id;
            $files = DB::table('tbl_my_support_files')->where('my_supports_id', $id)->get();
            $data[$key]->files = $files;
        }
        return response($data);
    }
}
