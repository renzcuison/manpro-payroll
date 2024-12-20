<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class RequirementField extends Model
{
    use HasFactory;

		/**
     * The table associated with the model.
     *
     * @var string
     */
    protected $table = 'requirement_field';

		protected $primaryKey = 'requirement_id';

		public $timestamps = false;

		protected $guarded = [];

		/**
     * The attributes that should be hidden for arrays.
     *
     * @var array
     */
    protected $hidden = [];

    public function options()
    {
      return $this->hasMany(RequirementChild::class, 'child_field_id');
    }

}