<?php

namespace App\Http\Controllers;

use App\Models\ReviewMaterial;
use App\Models\ReviewMaterialFiles;
use Illuminate\Http\Request;

class ReviewMaterialsController extends Controller
{
    public function index() {
		$reviewMaterials = ReviewMaterial::selectRaw('rm_id, title, date_created')->get();
		return response([
			"reviewMaterials" => $reviewMaterials
		]);
	}

	public function getReviewMaterialById($materialId) {
		$material = ReviewMaterialFiles::selectRaw("rm_file_id, filename")->where("rm_id", $materialId)->get();
		return response([
			"material" => $material
		]);
	}

}
