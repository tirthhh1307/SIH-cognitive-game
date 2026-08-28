from backend.services import viseme_service


def test_missing_rhubarb_returns_no_fabricated_visemes(monkeypatch):
    monkeypatch.setattr(viseme_service.shutil, "which", lambda _name: None)
    assert viseme_service.extract_rhubarb_visemes("missing.wav") == []
