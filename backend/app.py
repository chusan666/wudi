from flask import Flask, request, jsonify
from flask_cors import CORS
import os
from parsers.platform_detector import detect_platform
from parsers.xiaohongshu_parser import XiaohongshuParser
from parsers.douyin_parser import DouyinParser
from parsers.bilibili_parser import BilibiliParser
from parsers.kuaishou_parser import KuaishouParser
from analyzer.video_analyzer import VideoAnalyzer

app = Flask(__name__)
CORS(app)

app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024

parsers = {
    'xiaohongshu': XiaohongshuParser(),
    'douyin': DouyinParser(),
    'bilibili': BilibiliParser(),
    'kuaishou': KuaishouParser()
}

analyzer = VideoAnalyzer()

@app.route('/api/health', methods=['GET'])
def health_check():
    return jsonify({'status': 'ok', 'message': '服务运行正常'})

@app.route('/api/parse', methods=['POST'])
def parse_video():
    try:
        data = request.get_json()
        url = data.get('url', '').strip()
        
        if not url:
            return jsonify({'error': '请提供视频链接'}), 400
        
        platform = detect_platform(url)
        
        if not platform:
            return jsonify({'error': '不支持的平台或无效的链接'}), 400
        
        parser = parsers.get(platform)
        
        if not parser:
            return jsonify({'error': f'暂不支持 {platform} 平台'}), 400
        
        video_info = parser.parse(url)
        
        if not video_info:
            return jsonify({'error': '解析失败，请检查链接是否正确'}), 400
        
        video_info['platform'] = platform
        
        return jsonify({
            'success': True,
            'data': video_info
        })
        
    except Exception as e:
        return jsonify({'error': f'解析出错: {str(e)}'}), 500

@app.route('/api/analyze', methods=['POST'])
def analyze_video():
    try:
        data = request.get_json()
        video_info = data.get('video_info')
        analysis_type = data.get('analysis_type', 'comprehensive')
        
        if not video_info:
            return jsonify({'error': '请先解析视频'}), 400
        
        analysis_result = analyzer.analyze(video_info, analysis_type)
        
        return jsonify({
            'success': True,
            'data': analysis_result
        })
        
    except Exception as e:
        return jsonify({'error': f'分析出错: {str(e)}'}), 500

@app.route('/api/platforms', methods=['GET'])
def get_platforms():
    platforms = [
        {
            'id': 'xiaohongshu',
            'name': '小红书',
            'icon': '📱',
            'example': 'https://www.xiaohongshu.com/discovery/item/...'
        },
        {
            'id': 'douyin',
            'name': '抖音',
            'icon': '🎵',
            'example': 'https://www.douyin.com/video/...'
        },
        {
            'id': 'bilibili',
            'name': '哔哩哔哩',
            'icon': '📺',
            'example': 'https://www.bilibili.com/video/BV...'
        },
        {
            'id': 'kuaishou',
            'name': '快手',
            'icon': '⚡',
            'example': 'https://www.kuaishou.com/short-video/...'
        }
    ]
    
    return jsonify({
        'success': True,
        'data': platforms
    })

if __name__ == '__main__':
    os.makedirs('downloads', exist_ok=True)
    app.run(host='0.0.0.0', port=5000, debug=True)
