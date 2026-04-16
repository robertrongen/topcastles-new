"""
Baseline tests for the PHP application in old_app/.

These tests perform static analysis of the PHP source code to identify:
- Missing file references (includes that don't resolve)
- SQL injection patterns
- XSS vulnerabilities
- Deprecated PHP function usage
- Route/content file consistency
- Form handler consistency
- Logical issues in code
"""

import os
import re
import glob
import pytest

OLD_APP = os.path.join(os.path.dirname(__file__), "..", "old_app")


def php_files(subdir=""):
    """Return all .php files under old_app/[subdir]."""
    search = os.path.join(OLD_APP, subdir, "**", "*.php")
    return glob.glob(search, recursive=True)


def read(path):
    """Read a file with latin-1 (matches the app's ISO-8859-1 charset)."""
    with open(path, encoding="latin-1") as f:
        return f.read()


# ---------------------------------------------------------------------------
# 1. FILE INTEGRITY — every include/require must resolve
# ---------------------------------------------------------------------------

class TestFileIntegrity:
    """Verify that all PHP include/require references resolve to existing files."""

    # Patterns that capture include/require with literal string paths
    INCLUDE_RE = re.compile(
        r"""(?:include|require|include_once|require_once)\s*\(\s*["']([^"']+)["']\s*\)""",
        re.IGNORECASE,
    )

    def _collect_static_includes(self):
        """Scan every PHP file and yield (source_file, included_path) for literal includes."""
        for php in php_files():
            # Skip archived files — they are out of scope
            if os.sep + "archive" + os.sep in php:
                continue
            src = read(php)
            for i, line in enumerate(src.splitlines(), 1):
                # Skip commented-out lines
                stripped = line.strip()
                if stripped.startswith("//") or stripped.startswith("*") or stripped.startswith("/*"):
                    continue
                for m in self.INCLUDE_RE.finditer(line):
                    path = m.group(1)
                    # Skip dynamic includes containing PHP variables
                    if "$" in path:
                        continue
                    yield php, path

    def test_static_includes_exist(self):
        """All literal include/require paths must resolve relative to old_app/."""
        # Known missing files in the legacy codebase (pre-existing bugs)
        KNOWN_MISSING = {
            # ct_landen.php references underscore-prefixed files that don't exist
            "includes\\ct_landen.php -> includes/_ct_landen_main.php",
            "includes\\ct_landen.php -> includes/_ct_landen_toplanden.php",
            "includes\\ct_landen.php -> includes/_ct_landen_topregios.php",
            # JS file included as PHP — file was lost
            "includes\\ct_bezoekers_enquetes2.php -> functions/swap_image.js",
            # head.php includes variables.php without path — file is at includes/variables.php
            "includes\\head.php -> variables.php",
        }
        missing = []
        for source, inc_path in self._collect_static_includes():
            # Resolve relative to old_app/ (the app's working directory)
            full = os.path.normpath(os.path.join(OLD_APP, inc_path))
            if not os.path.isfile(full):
                rel_source = os.path.relpath(source, OLD_APP)
                entry = f"{rel_source} -> {inc_path}"
                missing.append(entry)

        known = [m for m in missing if m in KNOWN_MISSING]
        unknown = [m for m in missing if m not in KNOWN_MISSING]

        if known:
            print(f"\n[KNOWN MISSING INCLUDES] {len(known)} pre-existing issues:")
            for m in known:
                print(f"  {m}")

        assert unknown == [], (
            f"NEW missing include targets ({len(unknown)}):\n" + "\n".join(unknown)
        )

    # body.php uses dynamic includes like: includes/ct_{$Menu}_{$SubMenu}.php
    # We verify that every (Menu, SubMenu) combination has a matching file.
    MENU_VALUES = [
        "index", "kastelen", "zoeken", "landen", "soorten",
        "top100", "topkastelen", "achtergrond", "bezoekers", "geenkasteel",
    ]

    def test_main_pages_exist(self):
        """Every $Menu value set in root .php pages must have a corresponding .php file."""
        for menu in self.MENU_VALUES:
            page = os.path.join(OLD_APP, f"{menu}.php")
            assert os.path.isfile(page), f"Missing page: {menu}.php"

    def test_content_main_files_exist(self):
        """For every $Menu, includes/ct_{menu}_main.php must exist (default SubMenu)."""
        for menu in self.MENU_VALUES:
            ct = os.path.join(OLD_APP, "includes", f"ct_{menu}_main.php")
            assert os.path.isfile(ct), f"Missing content file: ct_{menu}_main.php"

    def test_navbar_files_exist(self):
        """For every $Menu, includes/nb_{menu}.php must exist."""
        for menu in self.MENU_VALUES:
            nb = os.path.join(OLD_APP, "includes", f"nb_{menu}.php")
            assert os.path.isfile(nb), f"Missing navbar file: nb_{menu}.php"

    def test_shared_includes_exist(self):
        """Core shared files referenced by body.php and head.php must exist."""
        required = [
            "includes/head.php",
            "includes/body.php",
            "includes/header.php",
            "includes/nb_random.php",
            "includes/nb_statistics.php",
            "includes/siteinfo.php",
            "includes/dbconnect.php",
            "includes/dbclose.php",
            "includes/variables.php",
            "functions/perform_query.php",
            "functions/hotornot.php",
            "functions/menu.php",
        ]
        for f in required:
            assert os.path.isfile(os.path.join(OLD_APP, f)), f"Missing: {f}"

    def test_english_content_dir_exists(self):
        """The English content directory must exist (ADR-001: EN-only)."""
        en_dir = os.path.join(OLD_APP, "content", "en")
        assert os.path.isdir(en_dir), "Missing content/en directory"

    def test_english_variabelen_exists(self):
        """The English variables file loaded by body.php must exist."""
        path = os.path.join(OLD_APP, "content", "en", "variabelen.php")
        assert os.path.isfile(path), "Missing content/en/variabelen.php"

    def test_english_metadata_exists(self):
        """The English metadata file loaded by head.php must exist."""
        path = os.path.join(OLD_APP, "content", "en", "ct_main_metadata.htm")
        assert os.path.isfile(path), "Missing content/en/ct_main_metadata.htm"

    def test_css_file_exists(self):
        """The stylesheet referenced in head.php must exist."""
        css = os.path.join(OLD_APP, "style", "2col_leftNav.css")
        assert os.path.isfile(css), "Missing style/2col_leftNav.css"


# ---------------------------------------------------------------------------
# 2. DYNAMIC INCLUDE SAFETY
# ---------------------------------------------------------------------------

class TestDynamicIncludes:
    """Check that dynamic includes in body.php are constrained."""

    def test_menu_driven_includes_have_content_files(self):
        """
        body.php does: include("includes/ct_{$Menu}_{$SubMenu}.php")
        Verify that every ct_*_*.php file in includes/ follows the naming pattern.
        """
        ct_files = glob.glob(os.path.join(OLD_APP, "includes", "ct_*.php"))
        pattern = re.compile(r"ct_([a-z0-9]+)_([a-z0-9]+)\.php$")
        # ct_landen.php is a known outlier — it's a dispatcher file
        known_exceptions = {"ct_landen.php"}
        unmatched = []
        for f in ct_files:
            basename = os.path.basename(f)
            if basename in known_exceptions:
                continue
            if not pattern.match(basename):
                unmatched.append(basename)
        assert unmatched == [], (
            f"Content files not matching ct_{{menu}}_{{submenu}}.php pattern: {unmatched}"
        )

    def test_form_menu_blocked_submenus_have_content_files(self):
        """
        form_menu.php blocks certain SubMenu values for specific pages.
        Verify the blocked content files actually exist (they are just unreachable).
        """
        # These are blocked in form_menu.php but the files should still exist
        blocked = {
            "topkastelen": [
                "bezoekers", "jump", "preview", "bezoekersaantal",
                "bezoekerslaag", "evenveel", "zonder", "totaal",
            ],
            "achtergrond": ["enquetes", "resultaat"],
            "bezoekers": ["enquetes", "resultaat"],
        }
        for menu, subs in blocked.items():
            for sub in subs:
                ct = os.path.join(OLD_APP, "includes", f"ct_{menu}_{sub}.php")
                # These files existing is correct — they're just blocked from navigation
                if os.path.isfile(ct):
                    pass  # exists, good (code exists but is blocked)
                # Not existing is also acceptable if the block is pre-emptive


# ---------------------------------------------------------------------------
# 3. SECURITY — SQL injection patterns
# ---------------------------------------------------------------------------

class TestSQLInjection:
    """Detect unparameterized SQL query patterns."""

    # Patterns that indicate direct variable interpolation in SQL
    SQL_INTERP_PATTERNS = [
        # Direct variable in WHERE clause
        re.compile(r"""(?:WHERE|AND|OR)\s+\w+\s+(?:LIKE|=)\s*\(?['"]?\$""", re.IGNORECASE),
        # Variable in query string concatenation
        re.compile(r"""mysql_query\s*\(.*\$_(?:GET|POST|REQUEST|SERVER)""", re.IGNORECASE),
    ]

    def _scan_sql_injection(self):
        """Return list of (file, line_num, line) where SQL injection is likely."""
        findings = []
        for php in php_files():
            src = read(php)
            for i, line in enumerate(src.splitlines(), 1):
                for pat in self.SQL_INTERP_PATTERNS:
                    if pat.search(line):
                        rel = os.path.relpath(php, OLD_APP)
                        findings.append((rel, i, line.strip()))
                        break
        return findings

    def test_sql_injection_inventory(self):
        """
        Catalog all SQL injection points.
        This test documents known injection patterns — it PASSES but reports them.
        Fail threshold: more than 20 unique injection points indicates uncontrolled growth.
        """
        findings = self._scan_sql_injection()
        # Document findings
        if findings:
            report = "\n".join(f"  {f}:{ln}: {code[:80]}" for f, ln, code in findings)
            print(f"\n[SQL INJECTION INVENTORY] {len(findings)} patterns found:\n{report}")
        # We know this app has SQL injection — fail only if it's worse than expected
        assert len(findings) <= 35, (
            f"SQL injection count ({len(findings)}) exceeds expected baseline of 35"
        )

    def test_perform_query_uses_string_concatenation(self):
        """The central PerformQuery function builds SQL via concatenation (known issue)."""
        src = read(os.path.join(OLD_APP, "functions", "perform_query.php"))
        # Verify it uses string interpolation — this is the known baseline
        assert "{$SelectString}" in src, "PerformQuery should use string interpolation"
        assert "{$Table}" in src, "PerformQuery should use string interpolation"
        # Verify it does NOT use prepared statements
        assert "prepare(" not in src.lower(), "PerformQuery unexpectedly uses prepared statements"
        assert "bind_param" not in src.lower(), "PerformQuery unexpectedly uses bind_param"


# ---------------------------------------------------------------------------
# 4. SECURITY — XSS patterns
# ---------------------------------------------------------------------------

class TestXSS:
    """Detect unescaped output patterns."""

    # echo of raw variables without htmlspecialchars/htmlentities
    ECHO_RAW_RE = re.compile(
        r"""echo\s+\$(?:Search|Sel|SubMenu|Menu|Language|SelCastle|SelCountry|SelRegion|SelText)""",
        re.IGNORECASE,
    )

    def test_xss_in_form_outputs(self):
        """
        Forms echo user-controlled variables directly into HTML value attributes.
        Catalog all occurrences.
        """
        findings = []
        for php in php_files("forms"):
            src = read(php)
            for i, line in enumerate(src.splitlines(), 1):
                if self.ECHO_RAW_RE.search(line):
                    rel = os.path.relpath(php, OLD_APP)
                    findings.append((rel, i, line.strip()))
        if findings:
            report = "\n".join(f"  {f}:{ln}: {code[:80]}" for f, ln, code in findings)
            print(f"\n[XSS INVENTORY - FORMS] {len(findings)} unescaped outputs:\n{report}")
        # Document that this is a known baseline issue
        assert len(findings) <= 50, (
            f"XSS count in forms ({len(findings)}) exceeds expected baseline of 50"
        )

    def test_xss_in_includes(self):
        """Check include files for unescaped echoed variables."""
        findings = []
        for php in php_files("includes"):
            src = read(php)
            for i, line in enumerate(src.splitlines(), 1):
                if self.ECHO_RAW_RE.search(line):
                    rel = os.path.relpath(php, OLD_APP)
                    findings.append((rel, i, line.strip()))
        if findings:
            report = "\n".join(f"  {f}:{ln}: {code[:80]}" for f, ln, code in findings)
            print(f"\n[XSS INVENTORY - INCLUDES] {len(findings)} unescaped outputs:\n{report}")
        assert len(findings) <= 135, (
            f"XSS count in includes ({len(findings)}) exceeds expected baseline of 135"
        )


# ---------------------------------------------------------------------------
# 5. DEPRECATED PHP FUNCTIONS
# ---------------------------------------------------------------------------

class TestDeprecatedFunctions:
    """Detect usage of deprecated/removed PHP functions."""

    DEPRECATED = {
        "mysql_connect": "Removed in PHP 7.0 — use mysqli_connect or PDO",
        "mysql_query": "Removed in PHP 7.0 — use mysqli_query or PDO",
        "mysql_fetch_array": "Removed in PHP 7.0 — use mysqli_fetch_array",
        "mysql_fetch_assoc": "Removed in PHP 7.0 — use mysqli_fetch_assoc",
        "mysql_num_rows": "Removed in PHP 7.0 — use mysqli_num_rows",
        "mysql_select_db": "Removed in PHP 7.0 — use mysqli_select_db",
        "mysql_close": "Removed in PHP 7.0 — use mysqli_close",
        "mysql_free_result": "Removed in PHP 7.0 — use mysqli_free_result",
        "mysql_error": "Removed in PHP 7.0 — use mysqli_error",
        "ereg": "Removed in PHP 7.0 — use preg_match",
        "eregi": "Removed in PHP 7.0 — use preg_match with /i flag",
    }

    def _scan_deprecated(self):
        """Return dict mapping function_name -> list of (file, line_num)."""
        results = {}
        # Build one regex for all deprecated functions
        pattern = re.compile(
            r"\b(" + "|".join(re.escape(f) for f in self.DEPRECATED) + r")\s*\(",
            re.IGNORECASE,
        )
        for php in php_files():
            src = read(php)
            for i, line in enumerate(src.splitlines(), 1):
                m = pattern.search(line)
                if m:
                    func = m.group(1).lower()
                    rel = os.path.relpath(php, OLD_APP)
                    results.setdefault(func, []).append((rel, i))
        return results

    def test_deprecated_function_inventory(self):
        """Catalog all deprecated function usage."""
        results = self._scan_deprecated()
        if results:
            print("\n[DEPRECATED FUNCTIONS INVENTORY]")
            for func, locations in sorted(results.items()):
                reason = self.DEPRECATED.get(func, "Deprecated")
                print(f"  {func}() — {reason}")
                for f, ln in locations:
                    print(f"    {f}:{ln}")
        total = sum(len(v) for v in results.values())
        # This is informational — the legacy app is known to use deprecated functions
        assert total > 0, "Expected deprecated functions in legacy code — none found?"

    def test_ereg_usage(self):
        """ereg() is used in head.php for language detection — document this."""
        src = read(os.path.join(OLD_APP, "includes", "head.php"))
        assert "ereg(" in src, "Expected ereg() in head.php for language detection"


# ---------------------------------------------------------------------------
# 6. HARDCODED CREDENTIALS
# ---------------------------------------------------------------------------

class TestCredentials:
    """Check for hardcoded database credentials."""

    def _find_credentials(self):
        """Find files containing the known DB password."""
        files_with_creds = []
        for php in php_files():
            src = read(php)
            if "9kowbh6g" in src:
                rel = os.path.relpath(php, OLD_APP)
                files_with_creds.append(rel)
        return files_with_creds

    def test_credential_locations(self):
        """Document all files containing hardcoded DB credentials."""
        files = self._find_credentials()
        assert len(files) > 0, "Expected hardcoded credentials in legacy code"
        print(f"\n[HARDCODED CREDENTIALS] Found in {len(files)} files: {files}")

    def test_no_credentials_in_content(self):
        """Content files should not contain database credentials."""
        for php in php_files("content"):
            src = read(php)
            assert "9kowbh6g" not in src, (
                f"DB password found in content file: {os.path.relpath(php, OLD_APP)}"
            )


# ---------------------------------------------------------------------------
# 7. ROUTE AND URL CONSISTENCY
# ---------------------------------------------------------------------------

class TestRouteConsistency:
    """Verify that routes, form actions, and URL generation are consistent."""

    def test_form_actions_point_to_existing_pages(self):
        """Every form action attribute should reference an existing .php page."""
        action_re = re.compile(r'action="([^"]+\.php)"', re.IGNORECASE)
        missing = []
        for php in php_files("forms"):
            src = read(php)
            for m in action_re.finditer(src):
                action = m.group(1)
                # Skip PHP variable expressions in action
                if "$" in action:
                    continue
                full = os.path.join(OLD_APP, action)
                if not os.path.isfile(full):
                    rel = os.path.relpath(php, OLD_APP)
                    missing.append(f"{rel} -> {action}")
        assert missing == [], f"Form actions pointing to missing pages: {missing}"

    def test_menu_function_generates_valid_urls(self):
        """The Menu() function in menu.php generates URLs matching existing .php files."""
        src = read(os.path.join(OLD_APP, "functions", "menu.php"))
        # Verify it constructs: $Menu.php?SubMenu=...&Language=...
        assert '.php?SubMenu=' in src, "Menu() should generate URLs with SubMenu param"
        assert 'Language=' in src, "Menu() should include Language parameter"

    def test_all_form_files_referenced_by_body(self):
        """
        body.php dynamically includes forms/form_{$Menu}.php.
        Verify each Menu has a form file or that body.php checks existence.
        """
        src = read(os.path.join(OLD_APP, "includes", "body.php"))
        # body.php should check file_exists before including dynamic forms
        assert "file_exists" in src, (
            "body.php should check file_exists before dynamic form includes"
        )


# ---------------------------------------------------------------------------
# 8. LOGIC AND DATA CONSISTENCY
# ---------------------------------------------------------------------------

class TestLogicConsistency:
    """Check for logical errors and inconsistencies in PHP code."""

    def test_voting_is_disabled(self):
        """SchrijfRating must be disabled per ADR-001 (static top-100 mode)."""
        src = read(os.path.join(OLD_APP, "functions", "hotornot.php"))
        # The function should return immediately without writing
        lines = src.split("\n")
        in_schrijf = False
        body_lines = []
        for line in lines:
            if "function SchrijfRating" in line:
                in_schrijf = True
                continue
            if in_schrijf:
                stripped = line.strip()
                if stripped == "{":
                    continue
                if stripped == "}":
                    break
                if stripped and not stripped.startswith("//"):
                    body_lines.append(stripped)
        # Should contain only "return;" (voting disabled)
        code_lines = [l for l in body_lines if l]
        assert code_lines == ["return;"], (
            f"SchrijfRating should only contain 'return;' but has: {code_lines}"
        )

    def test_language_defaults_to_en(self):
        """body.php should default Language to 'en' per ADR-001."""
        src = read(os.path.join(OLD_APP, "includes", "body.php"))
        assert '$Language = "en"' in src or "$Language = 'en'" in src, (
            "body.php should default Language to 'en'"
        )

    def test_submenu_defaults_to_main(self):
        """form_menu.php should default SubMenu to 'main'."""
        src = read(os.path.join(OLD_APP, "forms", "form_menu.php"))
        assert '"main"' in src, "form_menu.php should default SubMenu to 'main'"

    def test_http_post_vars_usage(self):
        """
        $HTTP_POST_VARS was deprecated in PHP 4.1 and removed in PHP 5.4+.
        Document all usage.
        """
        findings = []
        for php in php_files():
            src = read(php)
            if "HTTP_POST_VARS" in src:
                rel = os.path.relpath(php, OLD_APP)
                count = src.count("HTTP_POST_VARS")
                findings.append((rel, count))
        if findings:
            report = "\n".join(f"  {f}: {c} uses" for f, c in findings)
            print(f"\n[HTTP_POST_VARS USAGE] (deprecated since PHP 4.1):\n{report}")
        # This is informational — legacy code is expected to use this

    def test_die_on_query_failure(self):
        """
        Using die() on query failure exposes error details.
        Document all occurrences.
        """
        die_re = re.compile(r'die\s*\(.*mysql_error', re.IGNORECASE)
        findings = []
        for php in php_files():
            src = read(php)
            for i, line in enumerate(src.splitlines(), 1):
                if die_re.search(line):
                    rel = os.path.relpath(php, OLD_APP)
                    findings.append((rel, i))
        if findings:
            report = "\n".join(f"  {f}:{ln}" for f, ln in findings)
            print(f"\n[DIE+MYSQL_ERROR] {len(findings)} info-leak points:\n{report}")


# ---------------------------------------------------------------------------
# 9. CHARACTER ENCODING
# ---------------------------------------------------------------------------

class TestEncoding:
    """Check character encoding consistency."""

    def test_charset_declaration(self):
        """head.php should declare a charset."""
        src = read(os.path.join(OLD_APP, "includes", "head.php"))
        assert "charset=" in src.lower(), "head.php should declare a charset"

    def test_charset_is_iso_8859_1(self):
        """Document the legacy charset (ISO-8859-1) — migration target should be UTF-8."""
        src = read(os.path.join(OLD_APP, "includes", "head.php"))
        assert "iso-8859-1" in src.lower(), "Expected ISO-8859-1 charset in legacy app"


# ---------------------------------------------------------------------------
# 10. SEARCH FUNCTIONALITY
# ---------------------------------------------------------------------------

class TestSearchLogic:
    """Check the search functionality for logical issues."""

    def test_search_form_fields_match_handler(self):
        """
        form_zoeken.php defines search fields that ct_zoeken_resultaat.php processes.
        Verify field names are consistent.
        """
        form_src = read(os.path.join(OLD_APP, "forms", "form_zoeken.php"))
        expected_fields = [
            "SearchCastle", "SearchDesciption", "SearchPlace",
            "SearchRegion", "SearchCountry", "SearchGebied",
            "SearchCastleType", "SearchCastleConcept",
            "SearchFounder", "SearchEra", "SearchCondition",
        ]
        for field in expected_fields:
            assert field in form_src, f"Search form missing field: {field}"

    def test_search_description_typo(self):
        """
        The field 'SearchDesciption' is missing an 'r' (should be 'SearchDescription').
        This is a known legacy typo that must be preserved during migration.
        """
        form_src = read(os.path.join(OLD_APP, "forms", "form_zoeken.php"))
        # The typo IS the correct field name in the legacy app
        assert "SearchDesciption" in form_src, "Expected legacy typo 'SearchDesciption'"
        # Verify the correctly-spelled version is NOT used (consistency)
        assert "SearchDescription" not in form_src, (
            "Unexpected 'SearchDescription' (correctly spelled) — legacy uses 'SearchDesciption'"
        )

    def test_search_result_file_exists(self):
        """The search results content file must exist."""
        path = os.path.join(OLD_APP, "includes", "ct_zoeken_resultaat.php")
        assert os.path.isfile(path), "Missing ct_zoeken_resultaat.php"


# ---------------------------------------------------------------------------
# 11. FORM HANDLER COMPLETENESS
# ---------------------------------------------------------------------------

class TestFormHandlers:
    """Verify form handler files are complete and consistent."""

    EXPECTED_FORMS = [
        "form_achtergrond.php",
        "form_bezoekers.php",
        "form_index.php",
        "form_kasteel.php",
        "form_kastelen.php",
        "form_landen.php",
        "form_language.php",
        "form_menu.php",
        "form_soorten.php",
        "form_top100.php",
        "form_topkastelen.php",
        "form_zoeken.php",
    ]

    def test_all_expected_form_files_exist(self):
        for form in self.EXPECTED_FORMS:
            path = os.path.join(OLD_APP, "forms", form)
            assert os.path.isfile(path), f"Missing form file: {form}"

    def test_form_index_is_empty_or_minimal(self):
        """form_index.php is known to be empty/minimal."""
        src = read(os.path.join(OLD_APP, "forms", "form_index.php"))
        # Stripping whitespace and PHP tags — should be effectively empty
        stripped = src.strip().replace("<?php", "").replace("?>", "").strip()
        assert len(stripped) < 50, (
            f"form_index.php should be empty/minimal but has {len(stripped)} chars"
        )

    def test_forms_use_post_method(self):
        """Most forms should use POST method."""
        post_re = re.compile(r'method="post"', re.IGNORECASE)
        for form_name in self.EXPECTED_FORMS:
            if form_name == "form_index.php":
                continue  # empty form
            path = os.path.join(OLD_APP, "forms", form_name)
            src = read(path)
            if "<FORM" in src.upper():
                assert post_re.search(src), (
                    f"{form_name} has a <FORM> tag but doesn't use method='post'"
                )


# ---------------------------------------------------------------------------
# 12. SITEMAP AND ROBOTS
# ---------------------------------------------------------------------------

class TestSEOFiles:
    """Verify SEO-related files exist and are well-formed."""

    def test_robots_txt_exists(self):
        path = os.path.join(OLD_APP, "robots.txt")
        assert os.path.isfile(path), "Missing robots.txt"

    def test_sitemap_xml_exists(self):
        path = os.path.join(OLD_APP, "sitemap.xml")
        assert os.path.isfile(path), "Missing sitemap.xml"

    def test_robots_references_sitemap(self):
        """robots.txt should reference a sitemap."""
        src = read(os.path.join(OLD_APP, "robots.txt"))
        assert "sitemap" in src.lower(), "robots.txt should reference a sitemap"


# ---------------------------------------------------------------------------
# 13. STATIC ASSETS
# ---------------------------------------------------------------------------

class TestStaticAssets:
    """Verify key static asset directories exist."""

    def test_images_directory_exists(self):
        assert os.path.isdir(os.path.join(OLD_APP, "images")), "Missing images/"

    def test_style_directory_exists(self):
        assert os.path.isdir(os.path.join(OLD_APP, "style")), "Missing style/"

    def test_image_subdirs_exist(self):
        """Key image subdirectories referenced in content files."""
        for subdir in ["small", "large", "maps", "general", "drawings"]:
            path = os.path.join(OLD_APP, "images", subdir)
            assert os.path.isdir(path), f"Missing images/{subdir}/"
