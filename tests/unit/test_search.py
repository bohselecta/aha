from aha.storage.intake import receive
from aha.search import search_sources, rebuild


def test_uncited_source_text_search_is_exact_case_local_and_readonly(store, registry):
    text = "SYNTHETIC: an uncited café delivery at the service gate."
    receive(
        store,
        text.encode(),
        "account.txt",
        "text/plain",
        "reviewer",
        0,
        "search-source",
        "Synthetic source",
    )
    before = store.case()["case_revision"]
    found = search_sources(store, "ＣＡＦÉ service")
    assert len(found["hits"]) == 1
    assert found["hits"][0]["citation"]["quote"] == text
    assert found["coverage"]["indexed_source_count"] == 1
    assert search_sources(store, '" OR * -- missingword')["hits"] == []
    other = registry.create(
        dict(title="Other synthetic", timezone="UTC", synthetic=True), "reviewer"
    )
    assert search_sources(registry.get(other["id"]), "café")["hits"] == []
    rebuild(store)
    assert store.case()["case_revision"] == before
    assert len(search_sources(store, "delivery")["hits"]) == 1
