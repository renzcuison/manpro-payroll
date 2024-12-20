<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ReviewMaterialFiles extends Model
{
    use HasFactory;

		use HasFactory;

		/**
     * The table associated with the model.
     *
     * @var string
     */
    protected $table = 'review_materials_files';

		protected $primaryKey = 'rm_file_id';

		public $timestamps = false;

		protected $fillable = [];

		/**
     * The attributes that should be hidden for arrays.
     *
     * @var array
     */
    protected $hidden = [];
}
