package com.mini.util;

import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

public class CookieUtil {

    private CookieUtil() {
        // Utility class
    }

    /**
     * Create an httpOnly cookie.
     *
     * @param response   HttpServletResponse
     * @param name       Cookie name
     * @param value      Cookie value
     * @param maxAge     Max age in seconds
     * @param path       Cookie path
     * @param domain     Cookie domain (can be null)
     * @param secure     Whether cookie requires HTTPS
     * @param httpOnly   Whether cookie is httpOnly
     */
    public static void createCookie(HttpServletResponse response,
                                    String name,
                                    String value,
                                    int maxAge,
                                    String path,
                                    String domain,
                                    boolean secure,
                                    boolean httpOnly) {
        Cookie cookie = new Cookie(name, value);
        cookie.setMaxAge(maxAge);
        cookie.setPath(path);
        if (domain != null) {
            cookie.setDomain(domain);
        }
        cookie.setSecure(secure);
        cookie.setHttpOnly(httpOnly);
        response.addCookie(cookie);
    }

    /**
     * Get a cookie by name from the request.
     *
     * @param request HttpServletRequest
     * @param name    Cookie name
     * @return Cookie or null if not found
     */
    public static Cookie getCookie(HttpServletRequest request, String name) {
        Cookie[] cookies = request.getCookies();
        if (cookies == null) {
            return null;
        }
        for (Cookie cookie : cookies) {
            if (cookie.getName().equals(name)) {
                return cookie;
            }
        }
        return null;
    }

    /**
     * Delete a cookie by name.
     *
     * @param request  HttpServletRequest
     * @param response HttpServletResponse
     * @param name     Cookie name
     * @param path     Cookie path
     */
    public static void deleteCookie(HttpServletRequest request,
                                   HttpServletResponse response,
                                   String name,
                                   String path) {
        Cookie cookie = getCookie(request, name);
        if (cookie != null) {
            cookie.setValue("");
            cookie.setMaxAge(0);
            cookie.setPath(path);
            cookie.setHttpOnly(true);
            response.addCookie(cookie);
        }
    }
}
