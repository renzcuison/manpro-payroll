<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class PemeQType extends Model
{
    use HasFactory, SoftDeletes;

    protected $table = 'peme_q_type';
    protected $primaryKey = 'id';
    protected $fillable = [
        'peme_q_item_id',
        'input_type',
    ];

    public function pemeQuestionItem()
    {
        return $this->belongsTo(PemeQItem::class, 'peme_q_item_id');
    }

}