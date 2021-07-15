import { useState, useCallback, useEffect } from 'react';
import { GetStaticProps } from 'next';
import Head from 'next/head';
import Link from 'next/link';
import Prismic from '@prismicio/client';
import { FiCalendar, FiUser } from 'react-icons/fi';
import { getPrismicClient } from '../services/prismic';
import { formatStringDate } from '../services/format';

import styles from './home.module.scss';
import commonStyles from '../styles/common.module.scss';

interface Post {
  uid?: string;
  first_publication_date: string | null;
  data: {
    title: string;
    subtitle: string;
    author: string;
  };
}

interface PostPagination {
  next_page: string;
  results: Post[];
}

interface HomeProps {
  postsPagination: PostPagination;
}

export default function Home({ postsPagination }: HomeProps) {
  const [nextPage, setNextPage] = useState(postsPagination.next_page);
  const [posts, setPosts] = useState<Post[]>([] as Post[]);

  useEffect(() => {
    const results = postsPagination.results as Post[];
    setPosts([...posts, ...results]);
  }, []);

  const handleLoadMore = useCallback(() => {
    fetch(nextPage)
      .then(response => response.json())
      .then(response => {
        setNextPage(response.next_page);
        setPosts([
          ...posts,
          ...response.results.map(post => ({
            ...post,
            first_publication_date: formatStringDate(
              post.first_publication_date
            ),
          })),
        ]);
      });
  }, [nextPage, posts]);

  return (
    <>
      <Head>
        <title>Inicio | spacetraveling</title>
      </Head>

      <main className={`${styles.contentContainer} ${commonStyles.container}`}>
        <section>
          {posts.map(post => (
            <Link key={post.uid} href={`/post/${post.uid}`}>
              <a>
                <h1 className={commonStyles.postTitle}>{post.data.title}</h1>
                <p className={commonStyles.postParagraph}>
                  {post.data.subtitle}
                </p>

                <div className={commonStyles.postInfos}>
                  <div>
                    <FiCalendar color="#d7d7d7" />
                    <span className={commonStyles.postInfoText}>
                      {post.first_publication_date}
                    </span>
                  </div>

                  <div>
                    <FiUser color="#d7d7d7" />
                    <span className={commonStyles.postInfoText}>
                      {post.data.author}
                    </span>
                  </div>
                </div>
              </a>
            </Link>
          ))}
        </section>

        {nextPage && (
          <button type="button" onClick={handleLoadMore}>
            Carregar mais posts
          </button>
        )}
      </main>
    </>
  );
}

export const getStaticProps: GetStaticProps = async () => {
  const prismic = getPrismicClient();
  const { next_page, results } = await prismic.query(
    [Prismic.predicates.at('document.type', 'post')],
    {
      fetch: ['post.title', 'post.subtitle', 'post.author'],
      pageSize: 2,
    }
  );

  return {
    props: {
      postsPagination: {
        next_page,
        results: results.map(post => ({
          ...post,
          first_publication_date: formatStringDate(post.first_publication_date),
        })),
      },
    },
    revalidate: 60 * 10, // 10 minutes
  };
};
