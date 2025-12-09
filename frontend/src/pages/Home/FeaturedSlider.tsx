// src/pages/Home/FeaturedSlider.tsx
import { useEffect, useState, useCallback } from "react";
import {
    FaChevronLeft,
    FaChevronRight,
    FaPlay,
    FaInfoCircle,
} from "react-icons/fa";
import "./featured-slider.css";

import type { Movie } from "../../api/tmdb";
import { fetchPopular, TMDB_IMAGE_BASE } from "../../api/tmdb";

const BACKDROP_BASE = "https://image.tmdb.org/t/p/w1280";

export const FeaturedSlider = () => {
    const [movies, setMovies] = useState<Movie[]>([]);
    // 가짜 슬라이드 포함한 인덱스 (0 = 마지막 복제, 1~n = 실제, n+1 = 첫 복제)
    const [index, setIndex] = useState(1);
    const [enableTransition, setEnableTransition] = useState(true);

    // 인기 영화 가져오기
    useEffect(() => {
        const load = async () => {
            try {
                const list = await fetchPopular(1);
                const filtered = list
                    .filter((m) => m.backdrop_path)
                    .slice(0, 6);
                setMovies(filtered);
                setIndex(1); // 첫 로드 시 항상 1에서 시작
            } catch (e) {
                console.error(e);
            }
        };

        void load();
    }, []);

    const total = movies.length;

    // 앞뒤로 하나씩 복제한 가상 슬라이드 배열
    const virtualSlides =
        total > 0
            ? [movies[total - 1], ...movies, movies[0]]
            : [];

    const virtualTotal = virtualSlides.length;

    // 한 슬라이드가 차지하는 비율
    const slideWidthPercent =
        virtualTotal > 0 ? 100 / virtualTotal : 100;

    // 다음 슬라이드 (오른쪽)
    const goNext = useCallback(() => {
        if (!virtualTotal) return;
        setEnableTransition(true);
        setIndex((prev) => {
            const next = prev + 1;
            // 맨 끝 복제 슬라이드(n+1)까지만 이동
            return next >= virtualTotal ? virtualTotal - 1 : next;
        });
    }, [virtualTotal]);

    // 이전 슬라이드 (왼쪽)
    const goPrev = useCallback(() => {
        if (!virtualTotal) return;
        setEnableTransition(true);
        setIndex((prev) => {
            const next = prev - 1;
            // 맨 앞 복제 슬라이드(0)까지만 이동
            return next <= 0 ? 0 : next;
        });
    }, [virtualTotal]);

    // 3초마다 자동으로 goNext 호출
    useEffect(() => {
        if (!virtualTotal) return;
        const id = window.setInterval(() => {
            goNext();
        }, 3000);
        return () => window.clearInterval(id);
    }, [virtualTotal, goNext]);

    // transition 끝났을 때(복제 슬라이드에 도달하면) 눈에 안 보이게 점프
    useEffect(() => {
        if (!enableTransition) {
            const id = window.requestAnimationFrame(() => {
                setEnableTransition(true);
            });
            return () => window.cancelAnimationFrame(id);
        }
    }, [enableTransition]);

    const handleTransitionEnd = () => {
        if (!total || !virtualTotal) return;

        // 맨 끝 복제(첫 슬라이드 복제)에 도달 → 실제 첫 슬라이드(1)로 점프
        if (index === virtualTotal - 1) {
            setEnableTransition(false);
            setIndex(1);
        }

        // 맨 앞 복제(마지막 슬라이드 복제)에 도달 → 실제 마지막 슬라이드(total)로 점프
        if (index === 0) {
            setEnableTransition(false);
            setIndex(total);
        }
    };

    if (!total || !virtualTotal) {
        return null;
    }

    // 현재 인디케이터용 index (1~total → 0~total-1)
    const dotActive = (index - 1 + total) % total;

    return (
        <section className="featured-wrapper">
            <div className="featured-inner">
                {/* 슬라이더 트랙 */}
                <div
                    className="featured-track"
                    style={{
                        width: `${virtualTotal * 100}%`,
                        transform: `translateX(-${
                            index * slideWidthPercent
                        }%)`,
                        transition: enableTransition
                            ? "transform 0.55s cubic-bezier(0.22, 0.61, 0.36, 1)"
                            : "none",
                    }}
                    onTransitionEnd={handleTransitionEnd}
                >
                    {virtualSlides.map((movie, i) => {
                        const title = movie.title || "제목 없음";
                        const overview =
                            movie.overview ||
                            "설명이 제공되지 않는 영화입니다.";
                        const backdropUrl = movie.backdrop_path
                            ? `${BACKDROP_BASE}${movie.backdrop_path}`
                            : movie.poster_path
                                ? `${TMDB_IMAGE_BASE}${movie.poster_path}`
                                : undefined;

                        return (
                            <article
                                key={`${movie.id}-${i}`}
                                className="featured-card"
                                style={{
                                    width: `${slideWidthPercent}%`,
                                }}
                            >
                                {/* 왼쪽: 텍스트 */}
                                <div className="featured-text">
                                    <p className="featured-tag">
                                        오늘의 추천
                                    </p>
                                    <h2 className="featured-title">
                                        {title}
                                    </h2>
                                    <p className="featured-overview">
                                        {overview}
                                    </p>
                                    <div className="featured-actions">
                                        <button className="featured-btn primary">
                                            <FaPlay />
                                            <span>재생</span>
                                        </button>
                                        <button className="featured-btn ghost">
                                            <FaInfoCircle />
                                            <span>자세히 보기</span>
                                        </button>
                                    </div>
                                </div>

                                {/* 오른쪽: 이미지 */}
                                <div className="featured-image-wrap">
                                    {backdropUrl && (
                                        <img
                                            src={backdropUrl}
                                            alt={title}
                                            className="featured-image"
                                            loading="lazy"
                                        />
                                    )}
                                    <div className="featured-image-gradient" />
                                </div>
                            </article>
                        );
                    })}
                </div>

                {/* 좌우 화살표 */}
                <button
                    type="button"
                    className="featured-nav featured-nav-left"
                    onClick={goPrev}
                    aria-label="이전 추천"
                >
                    <FaChevronLeft />
                </button>
                <button
                    type="button"
                    className="featured-nav featured-nav-right"
                    onClick={goNext}
                    aria-label="다음 추천"
                >
                    <FaChevronRight />
                </button>

                {/* 인디케이터 점 (실제 슬라이드 개수만큼) */}
                <div className="featured-dots">
                    {movies.map((m, idx) => (
                        <button
                            key={m.id}
                            type="button"
                            className={
                                "featured-dot" +
                                (idx === dotActive ? " active" : "")
                            }
                            onClick={() => {
                                setEnableTransition(true);
                                setIndex(idx + 1); // 실제 슬라이드는 1~total
                            }}
                            aria-label={`추천 ${idx + 1}로 이동`}
                        />
                    ))}
                </div>
            </div>
        </section>
    );
};
