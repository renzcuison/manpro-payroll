<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class EvaluationCommentor extends Model
{
    use HasFactory;

    protected $table = 'evaluation_commentors';

    protected $primaryKey = ['response_id', 'commentor_id'];
    public $incrementing = false;

    protected $fillable = [
        'response_id',
        'commentor_id',
        'comment',
        'order',
        'signature_filepath',
        'deleted_at'
    ];

    public function commentor()
    {
        return $this->belongsTo(UsersModel::class, 'commentor_id');
    }

    protected function getKeyForSaveQuery()
    {

        $primaryKeyForSaveQuery = array(count($this->primaryKey));
        foreach ($this->primaryKey as $i => $pKey) {
            $primaryKeyForSaveQuery[$i] = isset($this->original[$this->getKeyName()[$i]])
                ? $this->original[$this->getKeyName()[$i]]
                : $this->getAttribute($this->getKeyName()[$i]);
        }
        return $primaryKeyForSaveQuery;

    }

    public function response()
    {
        return $this->belongsTo(EvaluationResponse::class, 'response_id');
    }

    protected function setKeysForSaveQuery($query)
    {

        foreach ($this->primaryKey as $i => $pKey) {
            $query->where($this->getKeyName()[$i], '=', $this->getKeyForSaveQuery()[$i]);
        }

        return $query;
    }
    
}
