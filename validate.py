#!/usr/bin/env python3
"""
Project validation script - checks for common issues
"""
import os
import json
from pathlib import Path

def check_file_exists(filepath, description):
    """Check if a file exists and report"""
    if Path(filepath).exists():
        print(f"✅ {description}: {filepath}")
        return True
    else:
        print(f"❌ {description}: {filepath} - NOT FOUND")
        return False

def check_html_structure():
    """Check HTML file for basic structure"""
    html_file = "index-new.html"
    if not Path(html_file).exists():
        print(f"❌ HTML file not found: {html_file}")
        return False
    
    with open(html_file, 'r', encoding='utf-8') as f:
        content = f.read()
    
    checks = [
        ('DOCTYPE', '<!DOCTYPE html>' in content),
        ('Module script', 'type="module"' in content),
        ('Main CSS', 'src/css/main.css' in content),
        ('Main JS', 'src/js/main.js' in content),
        ('Canvas elements', 'canvas' in content.lower()),
    ]
    
    print("\n📄 HTML Structure Checks:")
    for check_name, passed in checks:
        status = "✅" if passed else "❌"
        print(f"{status} {check_name}")
    
    return all(passed for _, passed in checks)

def check_js_modules():
    """Check JavaScript module structure"""
    js_files = [
        "src/js/main.js",
        "src/js/config.js",
        "src/components/CNNVisualization.js",
        "src/components/InteractiveDemo.js",
        "src/components/StepNavigation.js",
        "src/components/LoadingScreen.js",
        "src/components/Navigation.js",
        "src/components/Utilities.js"
    ]
    
    print("\n🔧 JavaScript Module Checks:")
    all_exist = True
    for js_file in js_files:
        exists = check_file_exists(js_file, "JS Module")
        all_exist = all_exist and exists
    
    return all_exist

def check_css_files():
    """Check CSS file structure"""
    css_files = [
        "src/css/main.css",
        "src/css/components.css"
    ]
    
    print("\n🎨 CSS File Checks:")
    all_exist = True
    for css_file in css_files:
        exists = check_file_exists(css_file, "CSS File")
        all_exist = all_exist and exists
    
    return all_exist

def check_package_json():
    """Check package.json structure"""
    if not Path("package.json").exists():
        print("❌ package.json not found")
        return False
    
    try:
        with open("package.json", 'r') as f:
            package_data = json.load(f)
        
        required_fields = ['name', 'version', 'scripts', 'type']
        print("\n📦 Package.json Checks:")
        
        all_good = True
        for field in required_fields:
            if field in package_data:
                print(f"✅ {field}: {package_data[field]}")
            else:
                print(f"❌ Missing field: {field}")
                all_good = False
        
        return all_good
        
    except json.JSONDecodeError:
        print("❌ package.json is not valid JSON")
        return False

def main():
    print("🔍 CNN Explorer Project Validation\n")
    
    # Change to project directory
    project_dir = Path(__file__).parent
    os.chdir(project_dir)
    print(f"📁 Project directory: {project_dir}\n")
    
    # Run checks
    checks = [
        ("HTML Structure", check_html_structure),
        ("JavaScript Modules", check_js_modules),
        ("CSS Files", check_css_files),
        ("Package Configuration", check_package_json)
    ]
    
    results = []
    for check_name, check_function in checks:
        try:
            result = check_function()
            results.append((check_name, result))
        except Exception as e:
            print(f"❌ Error in {check_name}: {e}")
            results.append((check_name, False))
    
    # Summary
    print("\n" + "="*50)
    print("📊 VALIDATION SUMMARY")
    print("="*50)
    
    passed = sum(1 for _, result in results if result)
    total = len(results)
    
    for check_name, result in results:
        status = "✅ PASS" if result else "❌ FAIL"
        print(f"{status} {check_name}")
    
    print(f"\n🎯 Overall: {passed}/{total} checks passed")
    
    if passed == total:
        print("🚀 Project is ready to run!")
        print("💡 Start with: python dev-server.py")
    else:
        print("⚠️  Some issues found. Please fix them before running.")
    
    return passed == total

if __name__ == "__main__":
    success = main()
    exit(0 if success else 1)
