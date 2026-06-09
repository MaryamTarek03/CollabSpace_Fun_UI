import React from 'react';
import { Zap, Monitor, Coffee, BookOpen, Music } from 'lucide-react';

const iconMap = {
    Zap,
    Monitor,
    Coffee,
    BookOpen,
    Music
};

export const getTemplateIcon = (iconName, size = 24) => {
    const IconComponent = iconMap[iconName] || Zap;
    return React.createElement(IconComponent, { size });
};

export const SPACE_TEMPLATES = [
    {
        id: 1,
        name: 'Art Gallery',
        category: 'CREATIVE',
        gradient: 'linear-gradient(135deg, #f6d365 0%, #fda085 100%)',
        defaultColor: '#fda085',
        iconName: 'Zap',
        defaultChannels: [
            { name: 'general', description: 'General chat for Art Gallery' },
            { name: 'practice', description: 'Share your work in progress' },
            { name: 'inspiration', description: 'Inspirational designs and references' },
            { name: 'feedback', description: 'Critique and constructive feedback' }
        ]
    },
    {
        id: 2,
        name: 'Cyber Lab',
        category: 'TECH',
        gradient: 'linear-gradient(135deg, #84fab0 0%, #8fd3f4 100%)',
        defaultColor: '#8fd3f4',
        iconName: 'Monitor',
        defaultChannels: [
            { name: 'general', description: 'General chat for Cyber Lab' },
            { name: 'practice', description: 'Code snippets and practice projects' },
            { name: 'bugs', description: 'Debugging and troubleshooting' },
            { name: 'showcase', description: 'Showcase your built apps' }
        ]
    },
    {
        id: 3,
        name: 'Cozy Lounge',
        category: 'MEETING',
        gradient: 'linear-gradient(135deg, #ff9a9e 0%, #fecfef 99%, #fecfef 100%)',
        defaultColor: '#ff9a9e',
        iconName: 'Coffee',
        defaultChannels: [
            { name: 'general', description: 'General chat for Cozy Lounge' },
            { name: 'recommendations', description: 'Music, movies, and book recommendations' },
            { name: 'gaming', description: 'Gaming and hobby chats' }
        ]
    },
    {
        id: 4,
        name: 'Classroom',
        category: 'EDUCATION',
        gradient: 'linear-gradient(135deg, #a1c4fd 0%, #c2e9fb 100%)',
        defaultColor: '#a1c4fd',
        iconName: 'BookOpen',
        defaultChannels: [
            { name: 'general', description: 'General announcements and discussion' },
            { name: 'lectures', description: 'Lecture notes and links' },
            { name: 'assignments', description: 'Assignment discussions' },
            { name: 'q-and-a', description: 'Questions and answers' }
        ]
    },
    {
        id: 5,
        name: 'Music Studio',
        category: 'CREATIVE',
        gradient: 'linear-gradient(135deg, #fbc2eb 0%, #a6c1ee 100%)',
        defaultColor: '#fbc2eb',
        iconName: 'Music',
        defaultChannels: [
            { name: 'general', description: 'General chat for Music Studio' },
            { name: 'jams', description: 'Audio clips, beats, and jam sessions' },
            { name: 'lyrics', description: 'Lyrics and songwriting discussions' },
            { name: 'production-tips', description: 'DAW tips and tricks' }
        ]
    }
];
