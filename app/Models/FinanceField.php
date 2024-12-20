<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class FinanceField extends Model
{
    use HasFactory;

		/**
     * The table associated with the model.
     *
     * @var string
     */
    protected $table = 'finance_field';

		protected $primaryKey = 'finance_id';

		public $timestamps = false;

		protected $guarded = [];

		/**
     * The attributes that should be hidden for arrays.
     *
     * @var array
     */
    protected $hidden = [];

    public function phase()
    {
      return $this->belongsTo(FinancePhase::class, 'finance_phase_id');
    }

}