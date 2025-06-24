<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class PemeQItem extends Model
{
    use HasFactory, SoftDeletes;

    protected $table = 'peme_q_item';
    protected $primaryKey = 'id';
    protected $fillable = [
        'peme_id',
        'question',
        'isRequired',
    ];
    public function peme()
    {
        return $this->belongsTo(Peme::class);
    }

    public function types()
    {
        return $this->hasMany(PemeQType::class, 'peme_q_item_id');
    }
}
