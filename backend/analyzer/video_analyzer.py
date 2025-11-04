import re
from datetime import datetime

class VideoAnalyzer:
    def analyze(self, video_info, analysis_type='comprehensive'):
        analysis_result = {
            'basic_info': self._analyze_basic_info(video_info),
            'engagement': self._analyze_engagement(video_info),
            'content': self._analyze_content(video_info),
            'recommendations': self._generate_recommendations(video_info)
        }
        
        if analysis_type == 'engagement':
            return {'engagement': analysis_result['engagement']}
        elif analysis_type == 'content':
            return {'content': analysis_result['content']}
        else:
            return analysis_result
    
    def _analyze_basic_info(self, video_info):
        basic_info = {
            'title': video_info.get('title', ''),
            'author': video_info.get('author', ''),
            'platform': video_info.get('platform', ''),
            'has_video_url': bool(video_info.get('video_url')),
            'has_cover': bool(video_info.get('cover'))
        }
        
        if video_info.get('duration'):
            duration = video_info['duration']
            minutes = duration // 60
            seconds = duration % 60
            basic_info['duration'] = f"{minutes}分{seconds}秒"
            basic_info['duration_category'] = self._categorize_duration(duration)
        
        if video_info.get('pubdate'):
            try:
                pubdate = datetime.fromtimestamp(video_info['pubdate'])
                basic_info['publish_date'] = pubdate.strftime('%Y-%m-%d %H:%M:%S')
                basic_info['days_since_publish'] = (datetime.now() - pubdate).days
            except:
                pass
        
        return basic_info
    
    def _analyze_engagement(self, video_info):
        likes = video_info.get('likes', 0)
        comments = video_info.get('comments', 0)
        shares = video_info.get('shares', 0)
        views = video_info.get('views', 0)
        
        engagement = {
            'likes': self._format_number(likes),
            'comments': self._format_number(comments),
            'shares': self._format_number(shares),
            'views': self._format_number(views),
            'total_interactions': self._format_number(likes + comments + shares)
        }
        
        if views > 0:
            engagement_rate = ((likes + comments + shares) / views) * 100
            engagement['engagement_rate'] = f"{engagement_rate:.2f}%"
            engagement['engagement_level'] = self._get_engagement_level(engagement_rate)
        
        if comments > 0 and likes > 0:
            comment_like_ratio = (comments / likes) * 100
            engagement['comment_like_ratio'] = f"{comment_like_ratio:.2f}%"
        
        if shares > 0 and likes > 0:
            share_like_ratio = (shares / likes) * 100
            engagement['share_like_ratio'] = f"{share_like_ratio:.2f}%"
        
        engagement['popularity_score'] = self._calculate_popularity_score(video_info)
        
        return engagement
    
    def _analyze_content(self, video_info):
        title = video_info.get('title', '')
        description = video_info.get('description', '')
        tags = video_info.get('tags', [])
        
        content_analysis = {
            'title_length': len(title),
            'description_length': len(description),
            'has_description': bool(description),
            'tags_count': len(tags),
            'tags': tags
        }
        
        if title:
            content_analysis['title_features'] = self._analyze_title(title)
        
        if description:
            content_analysis['description_features'] = self._analyze_description(description)
        
        content_analysis['content_type'] = self._detect_content_type(title, description, tags)
        
        return content_analysis
    
    def _generate_recommendations(self, video_info):
        recommendations = []
        
        title = video_info.get('title', '')
        description = video_info.get('description', '')
        tags = video_info.get('tags', [])
        
        if len(title) < 10:
            recommendations.append({
                'type': 'title',
                'level': 'warning',
                'message': '标题较短，建议增加到10-30个字符以提高吸引力'
            })
        elif len(title) > 50:
            recommendations.append({
                'type': 'title',
                'level': 'info',
                'message': '标题较长，考虑精简以提高可读性'
            })
        
        if not description or len(description) < 20:
            recommendations.append({
                'type': 'description',
                'level': 'warning',
                'message': '建议添加详细的视频描述，有助于提升搜索排名'
            })
        
        if not tags or len(tags) < 3:
            recommendations.append({
                'type': 'tags',
                'level': 'warning',
                'message': '建议添加3-5个相关标签，提高视频曝光度'
            })
        elif len(tags) > 10:
            recommendations.append({
                'type': 'tags',
                'level': 'info',
                'message': '标签数量较多，建议精选5-8个最相关的标签'
            })
        
        views = video_info.get('views', 0)
        likes = video_info.get('likes', 0)
        comments = video_info.get('comments', 0)
        
        if views > 1000 and comments < 10:
            recommendations.append({
                'type': 'engagement',
                'level': 'info',
                'message': '视频有一定播放量但评论较少，可以在评论区引导互动'
            })
        
        if views > 0:
            engagement_rate = ((likes + comments) / views) * 100
            if engagement_rate < 1:
                recommendations.append({
                    'type': 'engagement',
                    'level': 'warning',
                    'message': '互动率较低，建议优化内容质量或增加互动元素'
                })
            elif engagement_rate > 10:
                recommendations.append({
                    'type': 'engagement',
                    'level': 'success',
                    'message': '优秀的互动率！内容很受欢迎，继续保持'
                })
        
        if not recommendations:
            recommendations.append({
                'type': 'general',
                'level': 'success',
                'message': '视频各项指标表现良好！'
            })
        
        return recommendations
    
    def _categorize_duration(self, duration):
        if duration < 60:
            return '短视频（<1分钟）'
        elif duration < 180:
            return '中短视频（1-3分钟）'
        elif duration < 600:
            return '中等视频（3-10分钟）'
        else:
            return '长视频（>10分钟）'
    
    def _format_number(self, num):
        if num >= 10000:
            return f"{num/10000:.1f}万"
        else:
            return str(num)
    
    def _get_engagement_level(self, rate):
        if rate >= 10:
            return '优秀'
        elif rate >= 5:
            return '良好'
        elif rate >= 2:
            return '一般'
        else:
            return '较低'
    
    def _calculate_popularity_score(self, video_info):
        likes = video_info.get('likes', 0)
        comments = video_info.get('comments', 0)
        shares = video_info.get('shares', 0)
        views = video_info.get('views', 0)
        
        score = (likes * 1 + comments * 2 + shares * 3) / max(views, 1) * 1000
        
        if score >= 100:
            return '爆款视频'
        elif score >= 50:
            return '热门视频'
        elif score >= 10:
            return '表现良好'
        else:
            return '正常表现'
    
    def _analyze_title(self, title):
        features = {
            'has_emoji': bool(re.search(r'[\U0001F300-\U0001F9FF]', title)),
            'has_numbers': bool(re.search(r'\d', title)),
            'has_question': '?' in title or '？' in title,
            'has_exclamation': '!' in title or '！' in title
        }
        
        keywords = ['教程', '攻略', '分享', '推荐', '必看', '干货', '实用', '技巧']
        features['has_engaging_keywords'] = any(keyword in title for keyword in keywords)
        
        return features
    
    def _analyze_description(self, description):
        features = {
            'word_count': len(description),
            'has_hashtag': '#' in description,
            'has_at_mention': '@' in description,
            'has_url': bool(re.search(r'http[s]?://', description))
        }
        
        return features
    
    def _detect_content_type(self, title, description, tags):
        content = f"{title} {description} {' '.join(tags)}".lower()
        
        categories = {
            '教程/教学': ['教程', '教学', '怎么', '如何', '方法', '步骤'],
            '评测/测评': ['评测', '测评', '开箱', '体验', '使用感受'],
            '分享/日常': ['分享', '日常', 'vlog', '记录', '生活'],
            '美妆/时尚': ['美妆', '化妆', '穿搭', '时尚', '护肤'],
            '美食/探店': ['美食', '探店', '吃播', '做饭', '烹饪'],
            '游戏/娱乐': ['游戏', '娱乐', '搞笑', '剪辑'],
            '知识/科普': ['知识', '科普', '学习', '干货', '技巧']
        }
        
        detected_types = []
        for category, keywords in categories.items():
            if any(keyword in content for keyword in keywords):
                detected_types.append(category)
        
        return detected_types if detected_types else ['其他']
