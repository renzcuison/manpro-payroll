<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class HidePaymentPhase extends Model
{
    use HasFactory;

		/**
     * The table associated with the model.
     *
     * @var string
     */
    protected $table = 'tbl_hide_payment_phase';

		protected $primaryKey = 'hide_phase_id';

		public $timestamps = false;

		protected $fillable = [];

		/**
     * The attributes that should be hidden for arrays.
     *
     * @var array
     */
    protected $hidden = [];

}
