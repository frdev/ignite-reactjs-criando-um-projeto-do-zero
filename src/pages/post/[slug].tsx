import { GetStaticPaths, GetStaticProps } from 'next';
import Image from 'next/image';
import { FiCalendar, FiUser, FiClock } from 'react-icons/fi';
import { RichText } from 'prismic-dom';
import { getPrismicClient } from '../../services/prismic';

import commonStyles from '../../styles/common.module.scss';
import styles from './post.module.scss';
import { formatStringDate } from '../../services/format';

interface Post {
  first_publication_date: string | null;
  time_publication: string | null;
  data: {
    title: string;
    banner: {
      url: string;
    };
    author: string;
    content: {
      heading: string;
      body: {
        text: string;
      };
    }[];
  };
}

interface PostProps {
  post: Post;
}

export default function Post({ post }: PostProps) {
  return (
    <>
      <div className={commonStyles.container}>
        <Image
          alt="Image Alt"
          src={post.data.banner.url}
          width="1088"
          height="300"
          objectFit="contain"
        />
      </div>

      <section className={`${commonStyles.container} ${styles.postContainer}`}>
        <h1 className={commonStyles.pageTitle}>{post.data.title}</h1>

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

          <div>
            <FiClock color="#d7d7d7" />
            <span className={commonStyles.postInfoText}>4 min</span>
          </div>
        </div>
        <div className={styles.postContent}>
          {post.data.content.map(content => (
            <div>
              <h2 className={commonStyles.postTitle}>{content.heading}</h2>
              <div
                className={`${styles.postSection} ${commonStyles.postParagraph}`}
                dangerouslySetInnerHTML={{ __html: content.body.text }}
              />
            </div>
          ))}
        </div>
      </section>
    </>
  );
}

export const getStaticPaths = async () => {
  // const prismic = getPrismicClient();
  // const posts = await prismic.query(TODO);

  // TODO

  return {
    paths: [],
    fallback: 'blocking',
  };
};

export const getStaticProps: GetStaticProps = async ({ params }) => {
  const { slug } = params;
  const prismic = getPrismicClient();

  let post = {};

  try {
    const response = await prismic.getByUID('post', String(slug), {
      fetch: [
        'post.title',
        'post.first-content',
        'post.second-content',
        'post.author',
        'post.banner',
      ],
    });

    post = {
      first_publication_date: formatStringDate(response.first_publication_date),
      data: {
        title: response.data.title,
        banner: { url: response.data.banner.url },
        author: response.data.author,
        content: [
          {
            heading: response.data['first-content'][0]['first-key-text'],
            body: {
              text: RichText.asHtml(
                response.data['first-content'][0]['first-rich-text']
              ),
            },
          },
          {
            heading: response.data['second-content'][0]['second-key-text'],
            body: {
              text: RichText.asHtml(
                response.data['second-content'][0]['second-rich-text']
              ),
            },
          },
        ],
      },
    };
  } catch {
    // Fazer nada
  }

  return {
    props: {
      post,
    },
    revalidate: 60 * 30, // 30 minutes
  };
};
