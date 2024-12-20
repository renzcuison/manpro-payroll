<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class PreviousFilterModel extends Model
{
    use HasFactory;

    protected $table = 'previous_filter';

    protected $primaryKey = 'id';

    protected $fillable = [
        'user_id',
        'module',
        'page',
        'filter',
        'date',
        'created_at',
        'updated_at',
    ];

    public function user()
    {
        return $this->belongsTo(User::class, 'user_id', 'user_id');
    }
}
