from fastapi import APIRouter
from app.schemas.match import MatchRequest, PlayerResult
from app.services.match_parser import parse_match

router = APIRouter()

@router.post("/process-match", response_model=list[PlayerResult])
def process_match(request: MatchRequest):
    return parse_match(request.match_url) 