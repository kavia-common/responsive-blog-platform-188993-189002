#!/bin/bash
cd /home/kavia/workspace/code-generation/responsive-blog-platform-188993-189002/blog_frontend
npm run build
EXIT_CODE=$?
if [ $EXIT_CODE -ne 0 ]; then
   exit 1
fi

