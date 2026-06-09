import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

export default function InvitePage() {
    const { code } = useParams();
    const navigate = useNavigate();

    useEffect(() => {
        if (code) {
            // Redirect to dashboard with invite code in state
            // The Dashboard view will pick this up and open the Join Modal
            navigate('/', { state: { inviteCode: code }, replace: true });
        } else {
            navigate('/', { replace: true });
        }
    }, [code, navigate]);

    return (
        <div className="min-h-screen bg-[#FFFDF5] flex items-center justify-center">
            <div className="animate-spin w-12 h-12 border-4 border-black border-t-yellow-300 rounded-full"></div>
        </div>
    );
}
