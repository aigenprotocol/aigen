from pathlib import Path

from setuptools import setup, find_packages

this_directory = Path(__file__).parent
long_description = (this_directory / "README.md").read_text()

setup(
    name="aigen",
    version="0.1.0",
    license='MIT',
    author="Aigen Protocol",
    author_email='kailash@ravenprotocol.com',
    packages=find_packages(),
    long_description=long_description,
    long_description_content_type='text/markdown',
    description="Aigen's open-source tools to create AINFTs effortlessly",
    url='https://github.com/aigenprotocol/aigen',
    keywords="Aigen, open-source, AINFT, effortlessly",
    install_requires=[
        "python-dotenv",
        "tensorflow==2.11.0"
    ]
)
