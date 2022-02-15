/* eslint-disable prettier/prettier */
import { format } from 'date-fns';
import { pt } from 'date-fns/locale';
import { GetStaticPaths, GetStaticProps } from 'next';
import { useRouter } from 'next/router';
import { RichText } from 'prismic-dom';
import { FiCalendar, FiClock, FiUser } from 'react-icons/fi';
import Link from 'next/link';
import Prismic from '@prismicio/client';

import { getPrismicClient } from '../../services/prismic';

import commonStyles from '../../styles/common.module.scss';
import styles from './post.module.scss';
import Comments from '../../components/Comments';

interface Post {
  first_publication_date: string | null;
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
      }[];
    }[];
  };
}

interface PostProps {
  post: Post;
  preview: boolean;
}

export default function Post({ post, preview }: PostProps): JSX.Element {
  const totalWords = post.data.content.reduce((total, contentItem) => {
    total += (contentItem.heading.split(' ').length);
    const words = contentItem.body.map(item => item.text.split(' ').length);
    words.map(word => total += word);
    return total;
  }, 0)
  const readTime = Math.ceil(totalWords / 200);

  const router = useRouter();
  if (router.isFallback) {
    return <h1>Carregando...</h1>
  }

  return (
    <>
      <img src={post.data.banner.url} alt="banner" className={styles.banner} />
      <main className={commonStyles.container}>
        <div className={styles.post}>
          <div className={styles.postTop}>
            <h2>{post.data.title[0].text}</h2>
            <ul>
              <li>
                <FiCalendar /> {format(new Date(post.first_publication_date), 'dd MMM yyyy', { locale: pt })}
              </li>
              <li>
                <FiUser /> {post.data.author[0].text}
              </li>
              <li>
                <FiClock /> {`${readTime} min`}
              </li>
            </ul>
          </div>

          {post.data.content.map(data => {
            return (
              <article key={data.heading}>
                <h2>{data.heading}</h2>
                <div className={styles.postContent} dangerouslySetInnerHTML={{ __html: RichText.asHtml(data.body) }} />;
              </article>
            )
          })}


        </div>

        {preview && (
          <aside>
            <Link href="/api/exit-preview">
              <a href={commonStyles.preview}>
                Sair do modo Preview
              </a>
            </Link>
          </aside>
        )}

        <Comments />
          
      </main>
    </>

  )
}

export const getStaticPaths: GetStaticPaths = async () => {
  const prismic = getPrismicClient();
  const posts = await prismic.query([
    Prismic.predicates.at('document.type', 'posts'),
  ]);

  const paths = posts.results.map(post => {
    return {
      params: {
        slug: post.uid,
      }
    }
  })

  return {
    paths,
    fallback: true, // false or 'blocking'
  };
};

export const getStaticProps: GetStaticProps = async ({ params, previewData, preview = false }) => {
  const prismic = getPrismicClient();
  const { slug } = params;

  const previewRef = previewData ? previewData.ref : null
  const refOption = previewRef ? { ref: previewRef } : null

  const response = await prismic.getByUID('posts', String(slug), refOption);

  const post = {
    uid: response.uid,
    first_publication_date: response.first_publication_date,
    data: {
      title: response.data.title,
      subtitle: response.data.subtitle,
      banner: {
        url: response.data.banner.url
      },
      author: response.data.author,
      content: response.data.content.map(data => {
        return {
          heading: data.heading[0].text,
          body: [...data.body],
        }
      })
    },
  }

  return {
    props: {
      post,
      preview,
    },
  };

};
