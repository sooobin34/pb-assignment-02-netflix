// src/components/layout/Header.tsx
import { useState } from "react";
import { Link, NavLink } from "react-router-dom";
import "./header.css";
import { useAuth } from "../../hooks/useAuth";
import { useProfile } from "../../hooks/useProfile";
import { AccountMenu } from "../account/AccountMenu";

export const Header = () => {
    const { userEmail } = useAuth();
    const { activeProfile } = useProfile();
    const [isAccountOpen, setIsAccountOpen] = useState(false);

    // 프로필 이름이 있으면 우선 사용, 없으면 이메일 앞부분 사용
    const displayName =
        activeProfile?.name ?? (userEmail?.split("@")[0] ?? "사용자");

    return (
        <>
            <header className="app-header">
                {/* 왼쪽 : 로고 + 네비게이션 */}
                <div className="header-left">
                    <Link to="/" className="logo">
                        <span className="logo-icon" aria-hidden="true" />
                        <span className="logo-text">MyFlix</span>
                    </Link>

                    <nav className="main-nav">
                        <NavLink
                            to="/"
                            end
                            className={({ isActive }) =>
                                "nav-link" + (isActive ? " nav-link-active" : "")
                            }
                        >
                            Home
                        </NavLink>
                        <NavLink
                            to="/popular"
                            className={({ isActive }) =>
                                "nav-link" + (isActive ? " nav-link-active" : "")
                            }
                        >
                            Popular
                        </NavLink>
                        <NavLink
                            to="/search"
                            className={({ isActive }) =>
                                "nav-link" + (isActive ? " nav-link-active" : "")
                            }
                        >
                            Search
                        </NavLink>
                        <NavLink
                            to="/wishlist"
                            className={({ isActive }) =>
                                "nav-link" + (isActive ? " nav-link-active" : "")
                            }
                        >
                            Wishlist
                        </NavLink>
                    </nav>
                </div>

                {/* 오른쪽 : 인사 + 계정 설정 버튼 */}
                <div className="header-right">
                    {userEmail && (
                        <span className="header-welcome">
                            {displayName}님 환영합니다!
                        </span>
                    )}
                    <button
                        type="button"
                        className="header-account-btn"
                        onClick={() => setIsAccountOpen(true)}
                    >
                        계정 설정
                    </button>
                </div>
            </header>

            {/* 계정 설정 패널 */}
            {isAccountOpen && (
                <AccountMenu onClose={() => setIsAccountOpen(false)} />
            )}
        </>
    );
};
