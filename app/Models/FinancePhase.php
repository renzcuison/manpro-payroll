<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class FinancePhase extends Model
{
    use HasFactory;

		/**
     * The table associated with the model.
     *
     * @var string
     */
    protected $table = 'finance_phase';

		protected $primaryKey = 'phase_id';

		public $timestamps = false;

		protected $guarded = [];

		/**
     * The attributes that should be hidden for arrays.
     *
     * @var array
     */
    protected $hidden = [];

    public function fields()
    {
      return $this->hasMany(FinanceField::class, 'finance_phase_id');
    }

    public function space()
    {
        return $this->belongsTo(Space::class, 'phase_space_id', 'space_id');
    }

}