<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ListModel extends Model
{
    use HasFactory;

		/**
     * The table associated with the model.
     *
     * @var string
     */
    protected $table = 'list';

		protected $primaryKey = 'list_id';

		public $timestamps = false;

		protected $fillable = [];

		/**
     * The attributes that should be hidden for arrays.
     *
     * @var array
     */
    protected $hidden = [];

    public function steps()
    {
      return $this->hasMany(ServicesStep::class, 'list_id', 'list_id');
    }

    public function service()
    {
      return $this->belongsTo(Space::class, 'list_space_id');
    }

}